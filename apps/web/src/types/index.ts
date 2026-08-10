export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'PUBLISHED' | 'FAILED';

export type StorageProvider =
  | 'supabase_default'
  | 'supabase_custom'
  | 'cloudflare_r2'
  | 'aws_s3'
  | 'backblaze_b2'
  | 'wasabi'
  | 'supabase';

export interface UserRecord {
  id: string;
  email: string;
  google_id: string;
  youtube_refresh_token: string | null;
  r2_account_id: string | null;
  r2_access_key_id: string | null;
  r2_secret_access_key: string | null;
  r2_bucket_name: string | null;
  r2_public_domain: string | null;
  s3_endpoint: string | null;
  s3_region: string | null;
  s3_access_key: string | null;
  s3_secret_key: string | null;
  s3_bucket_name: string | null;
  supabase_url: string | null;
  supabase_service_role_key: string | null;
  storage_provider: StorageProvider;
  storage_setup_completed: boolean;
  created_at: string;
}

export interface JobRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  related_video_id: string | null;
  ai_enhancer_enabled: boolean;
  target_resolution: '1080p' | '4K';
  raw_video_url: string;
  processed_4k_url: string | null;
  status: JobStatus;
  scheduled_time: string;
  created_at: string;
}

export interface VerifyStoragePayload {
  userId: string;
  provider: StorageProvider;
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
  publicDomain?: string;
  s3Endpoint?: string;
  s3Region?: string;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
}
