import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import { JobRecord, UserRecord, CreateJobDto, StorageProvider } from '../types';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
      throw new Error('Supabase URL or Service Role Key missing from environment.');
    }
    supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });
  }
  return supabaseClient;
}

export async function findOrCreateUser(email: string, googleId: string): Promise<UserRecord> {
  const client = getSupabaseClient();
  
  const { data: existing, error: selectErr } = await client
    .from('users')
    .select('*')
    .eq('google_id', googleId)
    .maybeSingle();

  if (selectErr) {
    console.error('[Supabase Error] findOrCreateUser select failed:', selectErr);
  }

  if (existing) {
    return existing as UserRecord;
  }

  const { data: created, error: insertErr } = await client
    .from('users')
    .insert([{ email, google_id: googleId, storage_provider: 'supabase_default', storage_setup_completed: false }])
    .select()
    .single();

  if (insertErr || !created) {
    throw new Error(`Failed to create user record: ${insertErr?.message}`);
  }

  return created as UserRecord;
}

export async function saveUserRefreshToken(userId: string, encryptedRefreshToken: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from('users')
    .update({ youtube_refresh_token: encryptedRefreshToken })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to save encrypted YouTube refresh token: ${error.message}`);
  }
}

export async function saveUserSupabaseStorage(userId: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from('users')
    .update({
      storage_provider: 'supabase_default',
      s3_bucket_name: 'puffiflow-videos',
      r2_bucket_name: 'puffiflow-videos',
      storage_setup_completed: true,
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to save Supabase Storage setup: ${error.message}`);
  }
}

export async function saveUserMultiCloudStorage(
  userId: string,
  payload: {
    provider: StorageProvider;
    s3Endpoint?: string | null;
    s3Region?: string | null;
    encryptedAccessKey?: string | null;
    encryptedSecretKey?: string | null;
    bucketName?: string | null;
    publicDomain?: string | null;
    encryptedAccountId?: string | null;
    supabaseUrl?: string | null;
    encryptedSupabaseRoleKey?: string | null;
  }
): Promise<void> {
  const client = getSupabaseClient();
  const updatePayload: Record<string, any> = {
    storage_provider: payload.provider,
    storage_setup_completed: true,
    s3_endpoint: payload.s3Endpoint || null,
    s3_region: payload.s3Region || 'us-east-1',
    s3_access_key: payload.encryptedAccessKey || null,
    s3_secret_key: payload.encryptedSecretKey || null,
    s3_bucket_name: payload.bucketName || 'puffiflow-videos',
    r2_account_id: payload.encryptedAccountId || null,
    r2_access_key_id: payload.encryptedAccessKey || null,
    r2_secret_access_key: payload.encryptedSecretKey || null,
    r2_bucket_name: payload.bucketName || 'puffiflow-videos',
    r2_public_domain: payload.publicDomain || null,
    supabase_url: payload.supabaseUrl || null,
    supabase_service_role_key: payload.encryptedSupabaseRoleKey || null,
  };

  const { error } = await client
    .from('users')
    .update(updatePayload)
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to save storage configuration: ${error.message}`);
  }
}

export async function saveUserStorageCredentials(
  userId: string,
  credentials: {
    encryptedAccountId: string;
    encryptedAccessKeyId: string;
    encryptedSecretAccessKey: string;
    bucketName: string;
    publicDomain: string;
  }
): Promise<void> {
  return saveUserMultiCloudStorage(userId, {
    provider: 'cloudflare_r2',
    encryptedAccountId: credentials.encryptedAccountId,
    encryptedAccessKey: credentials.encryptedAccessKeyId,
    encryptedSecretKey: credentials.encryptedSecretAccessKey,
    bucketName: credentials.bucketName,
    publicDomain: credentials.publicDomain,
  });
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as UserRecord;
}

export async function createJobRecord(jobData: CreateJobDto): Promise<JobRecord> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('jobs')
    .insert([{
      user_id: jobData.userId,
      title: jobData.title,
      description: jobData.description || '',
      thumbnail_url: jobData.thumbnailUrl || null,
      related_video_id: jobData.relatedVideoId || null,
      ai_enhancer_enabled: jobData.aiEnhancerEnabled ?? true,
      target_resolution: jobData.targetResolution || '4K',
      raw_video_url: jobData.rawVideoUrl,
      status: 'QUEUED',
      scheduled_time: jobData.scheduledTime
    }])
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create job record: ${error?.message}`);
  }

  return data as JobRecord;
}

export async function updateJobStatus(
  jobId: string,
  status: JobRecord['status'],
  processed4kUrl?: string | null
): Promise<void> {
  const client = getSupabaseClient();
  const updatePayload: Partial<JobRecord> = { status };
  if (processed4kUrl !== undefined) {
    updatePayload.processed_4k_url = processed4kUrl;
  }

  const { error } = await client
    .from('jobs')
    .update(updatePayload)
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to update job status: ${error.message}`);
  }
}

export async function getPendingCompletedJobs(): Promise<JobRecord[]> {
  const client = getSupabaseClient();
  const now = new Date().toISOString();

  const { data, error } = await client
    .from('jobs')
    .select('*')
    .eq('status', 'COMPLETED')
    .lte('scheduled_time', now);

  if (error) {
    console.error('[Supabase Error] Failed to fetch pending completed jobs:', error);
    return [];
  }

  return (data || []) as JobRecord[];
}

export async function getAllJobsForUser(userId: string): Promise<JobRecord[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase Error] Failed to fetch user jobs:', error);
    return [];
  }

  return (data || []) as JobRecord[];
}
