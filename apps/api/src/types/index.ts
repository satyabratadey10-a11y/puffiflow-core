export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'PUBLISHED' | 'FAILED';

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

export interface CreateJobDto {
  userId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  relatedVideoId?: string;
  aiEnhancerEnabled?: boolean;
  targetResolution?: '1080p' | '4K';
  rawVideoUrl: string;
  scheduledTime: string;
}

export interface VerifyStorageDto {
  userId: string;
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain?: string;
}

export interface ModalWebhookPayload {
  jobId: string;
  status: 'COMPLETED' | 'FAILED';
  processed4kUrl?: string;
  error?: string;
}

export interface PresignUploadDto {
  userId: string;
  fileName: string;
  contentType: string;
  fileType?: 'video' | 'thumbnail';
}

export interface DecryptedUserR2Credentials {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
}
