import { google } from 'googleapis';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import { config } from '../config/env';

const API_BASE_URL = (process.env.API_URL || 'https://puffiflow-core.onrender.com')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');

export const YOUTUBE_REDIRECT_URI =
  process.env.YOUTUBE_REDIRECT_URI ||
  config.youtubeRedirectUri ||
  `${API_BASE_URL}/api/auth/youtube/callback`;

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID || config.youtubeClientId;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET || config.youtubeClientSecret;

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    YOUTUBE_REDIRECT_URI
  );
}

export const getGoogleOAuthClient = getOAuth2Client;

export function generateYoutubeAuthUrl(state?: string): string {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state: state || 'puffiflow'
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function publishVideoToYoutube(options: {
  refreshToken: string;
  videoUrl: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  relatedVideoId?: string | null;
}): Promise<{ videoId: string; youtubeUrl: string }> {
  const { refreshToken, videoUrl, title, description, thumbnailUrl, relatedVideoId } = options;

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  // Stream 4K video binary directly from user's R2 URL to YouTube API without local disk caching
  console.log(`[YouTube Publisher] Fetching video stream from R2 URL: ${videoUrl}`);
  const response = await fetch(videoUrl);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download video stream from R2 URL (Status ${response.status})`);
  }

  const videoStream = response.body as unknown as Readable;

  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
  });

  // Prepare description with linked video reference if provided
  let fullDescription = description || 'Upscaled in 4K via PuffiFlow Serverless AI Pipeline';
  if (relatedVideoId && relatedVideoId.trim()) {
    fullDescription += `\n\n🔗 Watch Related Video: https://www.youtube.com/watch?v=${relatedVideoId.trim()}`;
  }

  console.log(`[YouTube Publisher] Starting direct video insert stream to YouTube API...`);
  const insertResponse = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description: fullDescription,
        categoryId: '28', // Science & Technology
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false
      }
    },
    media: {
      mimeType: 'video/mp4',
      body: videoStream
    }
  });

  const videoId = insertResponse.data.id;
  if (!videoId) {
    throw new Error('YouTube API response did not contain a valid video ID');
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  console.log(`[YouTube Publisher] Successfully published video: ${youtubeUrl}`);

  // Upload Custom Thumbnail if provided
  if (thumbnailUrl) {
    try {
      console.log(`[YouTube Publisher] Uploading custom thumbnail from R2: ${thumbnailUrl}`);
      const thumbResponse = await fetch(thumbnailUrl);
      if (thumbResponse.ok && thumbResponse.body) {
        const thumbStream = thumbResponse.body as unknown as Readable;
        const mimeType = thumbResponse.headers.get('content-type') || 'image/jpeg';
        await youtube.thumbnails.set({
          videoId,
          media: {
            mimeType,
            body: thumbStream
          }
        });
        console.log(`[YouTube Publisher] Custom thumbnail successfully attached to video ${videoId}`);
      }
    } catch (thumbErr) {
      console.warn(`[YouTube Publisher Warning] Failed to upload thumbnail for video ${videoId}:`, thumbErr);
    }
  }

  return { videoId, youtubeUrl };
}
