import { Router, Request, Response } from 'express';
import { generateYoutubeAuthUrl, exchangeCodeForTokens, getOAuth2Client } from '../services/youtube';
import { findOrCreateUser, saveUserRefreshToken } from '../services/supabase';
import { encryptToken } from '../services/crypto';
import { google } from 'googleapis';

const router = Router();

// 1. Get YouTube OAuth Authorization URL
router.get('/auth/youtube/url', (req: Request, res: Response) => {
  const userId = req.query.userId as string || 'default-user';
  const url = generateYoutubeAuthUrl(userId);
  return res.status(200).json({ success: true, url });
});

// 2. YouTube OAuth Callback Handler
router.get('/auth/youtube/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  if (!code) {
    return res.status(400).send('Authorization code missing');
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      return res.status(400).send('Refresh token not granted. Please revoke access in Google Security settings and re-authenticate.');
    }

    // Get user profile info using access token
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email || `user_${Date.now()}@puffiflow.io`;
    const googleId = userInfo.data.id || state || `gid_${Date.now()}`;

    // Encrypt refresh token before storing
    const encryptedRefreshToken = encryptToken(tokens.refresh_token);

    // Save user and refresh token in Supabase
    const user = await findOrCreateUser(email, googleId);
    await saveUserRefreshToken(user.id, encryptedRefreshToken);

    // Redirect user back to Next.js dashboard with userId
    const redirectUrl = `http://localhost:3000/dashboard?userId=${user.id}&youtubeConnected=true`;
    return res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('[YouTube OAuth Callback Error]:', error);
    return res.status(500).send(`OAuth Authentication failed: ${error.message}`);
  }
});

export default router;
