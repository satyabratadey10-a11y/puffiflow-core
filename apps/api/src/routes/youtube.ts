import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import {
  generateYoutubeAuthUrl,
  exchangeCodeForTokens,
  getOAuth2Client,
  YOUTUBE_REDIRECT_URI
} from '../services/youtube';
import { findOrCreateUser, saveUserRefreshToken, getUserById, getSupabaseClient } from '../services/supabase';
import { encryptToken } from '../services/crypto';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://puffiflow-core-web-t8e1.vercel.app').replace(/\/+$/, '');

export { getOAuth2Client, YOUTUBE_REDIRECT_URI };

// 1. Authorization Redirect (GET /api/auth/youtube)
router.get(['/auth/youtube', '/'], (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || (req.query.state as string) || 'default-user';
  const url = generateYoutubeAuthUrl(userId);
  return res.redirect(url);
});

// JSON endpoint for auth URL
router.get('/auth/youtube/url', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default-user';
  const url = generateYoutubeAuthUrl(userId);
  return res.status(200).json({ success: true, url });
});

// 2. OAuth Callback (GET /api/auth/youtube/callback or GET /callback)
router.get(['/auth/youtube/callback', '/callback'], async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error('[Google OAuth Error]:', error);
    return res.redirect(`${FRONTEND_URL}/dashboard?youtube_error=${encodeURIComponent(String(error))}`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect(`${FRONTEND_URL}/dashboard?youtube_error=missing_code`);
  }

  try {
    const client = getOAuth2Client();
    const { tokens } = await client.getToken({
      code,
      redirect_uri: YOUTUBE_REDIRECT_URI
    });
    client.setCredentials(tokens);

    // Fetch connected YouTube channel details
    let channelId = '';
    let channelTitle = 'Connected Channel';
    try {
      const youtube = google.youtube({ version: 'v3', auth: client });
      const channelRes = await youtube.channels.list({
        mine: true,
        part: ['snippet']
      });

      const channel = channelRes.data.items?.[0];
      if (channel) {
        channelId = channel.id || '';
        channelTitle = channel.snippet?.title || 'Connected Channel';
      }
    } catch (chErr: any) {
      console.warn('[YouTube channels.list Warning]:', chErr?.message || chErr);
    }

    // Encrypt refresh token if returned
    let encryptedRefreshToken: string | null = null;
    if (tokens.refresh_token) {
      encryptedRefreshToken = encryptToken(tokens.refresh_token);
    }

    const targetUserId = state && state !== 'puffiflow' ? String(state) : null;
    if (targetUserId) {
      const updatePayload: any = {
        youtube_channel_id: channelId,
        youtube_channel_title: channelTitle
      };
      if (encryptedRefreshToken) {
        updatePayload.youtube_refresh_token = encryptedRefreshToken;
      }
      const supabase = getSupabaseClient();
      await supabase.from('users').update(updatePayload).eq('id', targetUserId);
    }

    console.log(`[YouTube OAuth] Successfully linked channel "${channelTitle}" (${channelId}) for user ${targetUserId}`);

    return res.redirect(
      `${FRONTEND_URL}/dashboard?userId=${encodeURIComponent(targetUserId || '')}&youtube_connected=true&channel=${encodeURIComponent(channelTitle)}`
    );
  } catch (err: any) {
    console.error('YouTube Token Exchange Error:', err?.response?.data || err?.message || err);
    return res.redirect(`${FRONTEND_URL}/dashboard?youtube_error=exchange_failed`);
  }
});

// 3. Status Check (GET /api/youtube/status) - Protected & IDOR-safe
router.get(['/youtube/status', '/status'], requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authenticatedUserId = req.user?.id;
    if (!authenticatedUserId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    const user = await getUserById(authenticatedUserId);
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
    console.error('[YouTube Status Error]:', error.message || error);
    return res.status(500).json({ error: 'Failed to fetch YouTube status' });
  }
});

export default router;
