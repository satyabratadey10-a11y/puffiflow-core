import { Router, Request, Response } from 'express';
import { generateYoutubeAuthUrl, exchangeCodeForTokens, getOAuth2Client } from '../services/youtube';
import { findOrCreateUser, saveUserRefreshToken, getUserById } from '../services/supabase';
import { encryptToken } from '../services/crypto';
import { google } from 'googleapis';

const router = Router();

// 1. Authorization Redirect (GET /api/auth/youtube)
router.get('/auth/youtube', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || (req.query.state as string) || 'default-user';
  const url = generateYoutubeAuthUrl(userId);
  return res.redirect(url);
});

// Also support GET /api/auth/youtube/url for JSON client requests
router.get('/auth/youtube/url', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default-user';
  const url = generateYoutubeAuthUrl(userId);
  return res.status(200).json({ success: true, url });
});

// 2. OAuth Callback (GET /api/auth/youtube/callback)
router.get('/auth/youtube/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string; // Target userId

  if (!code) {
    return res.status(400).send('Authorization code missing');
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      console.warn('[YouTube OAuth Warning] Refresh token not returned by Google. User may need to revoke app access in Google Account permissions.');
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);

    // Fetch connected YouTube channel details
    let channelId: string | null = null;
    let channelTitle: string | null = null;

    try {
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
      const channelRes = await youtube.channels.list({
        mine: true,
        part: ['snippet'],
      });
      if (channelRes.data.items && channelRes.data.items.length > 0) {
        const ch = channelRes.data.items[0];
        channelId = ch.id || null;
        channelTitle = ch.snippet?.title || null;
      }
    } catch (chErr) {
      console.warn('[YouTube Channel Details Error]:', chErr);
    }

    // Get user email
    let email = `user_${Date.now()}@puffiflow.io`;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      if (userInfo.data.email) email = userInfo.data.email;
    } catch (uErr) {
      console.warn('[User Info Error]:', uErr);
    }

    const targetUserId = state && state !== 'puffiflow' ? state : null;
    let user;
    if (targetUserId) {
      user = await getUserById(targetUserId);
    }

    if (!user) {
      user = await findOrCreateUser(email, targetUserId || `gid_${Date.now()}`);
    }

    // Save encrypted refresh token if returned, or preserve existing
    if (tokens.refresh_token) {
      const encryptedRefreshToken = encryptToken(tokens.refresh_token);
      await saveUserRefreshToken(user.id, encryptedRefreshToken, channelId, channelTitle);
    } else if (channelId || channelTitle) {
      const client = (await import('../services/supabase')).getSupabaseClient();
      await client
        .from('users')
        .update({ youtube_channel_id: channelId, youtube_channel_title: channelTitle })
        .eq('id', user.id);
    }

    console.log(`[YouTube OAuth] Successfully linked channel "${channelTitle}" (${channelId}) for user ${user.id}`);

    const frontendUrl = process.env.FRONTEND_URL || 'https://puffiflow-core-web-t8e1.vercel.app';
    const redirectUrl = `${frontendUrl}/dashboard?userId=${user.id}&youtube_connected=true`;
    return res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('[YouTube OAuth Callback Error]:', error);
    return res.status(500).send(`OAuth Authentication failed: ${error.message}`);
  }
});

// 3. Status Check (GET /api/youtube/status)
router.get('/youtube/status', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required.' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isConnected = !!user.youtube_refresh_token;
    return res.status(200).json({
      success: true,
      connected: isConnected,
      channelId: user.youtube_channel_id || null,
      channelTitle: user.youtube_channel_title || null,
    });
  } catch (error: any) {
    console.error('[YouTube Status Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch YouTube status', details: error.message });
  }
});

export default router;
