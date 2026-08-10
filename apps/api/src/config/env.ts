import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiSecretKey: process.env.API_SECRET_KEY || 'puffiflow_secret_internal_key',
  
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',

  r2AccountId: process.env.R2_ACCOUNT_ID || '',
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  r2BucketName: process.env.R2_BUCKET_NAME || 'puffiflow-videos',
  r2PublicDomain: process.env.R2_PUBLIC_DOMAIN || '',

  modalWebhookUrl: process.env.MODAL_WEBHOOK_URL || '',
  modalApiKey: process.env.MODAL_API_KEY || '',

  youtubeClientId: process.env.YOUTUBE_CLIENT_ID || '',
  youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
  youtubeRedirectUri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5000/api/auth/youtube/callback',

  encryptionSecret: process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_SECRET || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
};

export function validateEnv(): void {
  const missing: string[] = [];
  if (!config.supabaseUrl) missing.push('SUPABASE_URL');
  if (!config.supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0 && config.nodeEnv === 'production') {
    throw new Error(`[PuffiFlow Fatal] Missing required environment variables: ${missing.join(', ')}`);
  }
}
