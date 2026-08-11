import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createClient } from '@supabase/supabase-js';
import { getUserById, getSupabaseClient } from './supabase';
import { decryptToken } from './crypto';
import { config } from '../config/env';
import { DecryptedUserR2Credentials } from '../types';

export function getGenericS3Client(
  endpoint: string | undefined,
  region: string | undefined,
  accessKeyId: string,
  secretAccessKey: string
): S3Client {
  return new S3Client({
    region: region || 'us-east-1',
    endpoint: endpoint && endpoint.trim() !== '' ? endpoint : undefined,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: endpoint ? true : undefined, // Useful for MinIO / custom S3 endpoints
  });
}

export function getS3Client(accountId: string, accessKeyId: string, secretAccessKey: string): S3Client {
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  return getGenericS3Client(endpoint, 'auto', accessKeyId, secretAccessKey);
}

export async function getUserR2Credentials(userId: string): Promise<DecryptedUserR2Credentials> {
  const user = await getUserById(userId);
  if (!user || !user.storage_setup_completed) {
    throw new Error(`User ${userId} has not completed storage setup. Please visit /dashboard/setup.`);
  }

  const accountId = user.r2_account_id ? decryptToken(user.r2_account_id) : '';
  const accessKeyId = user.r2_access_key_id ? decryptToken(user.r2_access_key_id) : (user.s3_access_key ? decryptToken(user.s3_access_key) : '');
  const secretAccessKey = user.r2_secret_access_key ? decryptToken(user.r2_secret_access_key) : (user.s3_secret_key ? decryptToken(user.s3_secret_key) : '');
  const bucketName = user.r2_bucket_name || user.s3_bucket_name || 'puffiflow-videos';
  const publicDomain = user.r2_public_domain || `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicDomain };
}

export async function verifyR2Credentials(
  accountId: string,
  accessKeyId: string,
  secretAccessKey: string,
  bucketName: string
): Promise<boolean> {
  try {
    const client = getS3Client(accountId, accessKeyId, secretAccessKey);
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await client.send(command);
    return true;
  } catch (error: any) {
    console.error(`[R2 Verification Error] Bucket ${bucketName} check failed:`, error.message || error);
    throw new Error(`R2 connection verification failed: ${error.message || 'Invalid credentials or bucket name'}`);
  }
}

export async function verifyS3Credentials(
  endpoint: string | undefined,
  region: string | undefined,
  accessKeyId: string,
  secretAccessKey: string,
  bucketName: string
): Promise<boolean> {
  try {
    const client = getGenericS3Client(endpoint, region, accessKeyId, secretAccessKey);
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await client.send(command);
    return true;
  } catch (error: any) {
    console.error(`[S3 Verification Error] Bucket ${bucketName} check failed:`, error.message || error);
    throw new Error(`S3 connection verification failed: ${error.message || 'Invalid credentials, region, endpoint, or bucket name'}`);
  }
}

export async function generatePresignedUploadUrl(
  userId: string,
  filename: string,
  contentType: string,
  fileType: 'video' | 'thumbnail' = 'video'
): Promise<{ uploadUrl: string; objectKey: string; publicUrl: string }> {
  const user = await getUserById(userId);
  if (!user || !user.storage_setup_completed) {
    throw new Error(`User ${userId} has not completed storage setup. Please visit /dashboard/setup.`);
  }

  const fileExt = filename.includes('.') ? filename.split('.').pop() : (fileType === 'thumbnail' ? 'jpg' : 'mp4');
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const prefix = fileType === 'thumbnail' ? 'thumbnails' : 'raw';
  const objectKey = `${prefix}/${uniqueId}.${fileExt}`;
  const provider = user.storage_provider || 'supabase_default';

  // 1. Supabase Default Free Project Storage
  if (provider === 'supabase_default' || provider === 'supabase') {
    const supabase = getSupabaseClient();
    const bucket = user.s3_bucket_name || user.r2_bucket_name || 'puffiflow-videos';
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(objectKey, { upsert: true });

    if (error || !data) {
      console.error(`[Supabase Storage Error] Failed to create signed upload URL for ${objectKey}:`, error);
      throw new Error(`Failed to generate Supabase upload URL: ${error?.message || 'Unknown error'}`);
    }

    const uploadUrl = data.signedUrl;
    const publicUrl = `${config.supabaseUrl}/storage/v1/object/public/${bucket}/${objectKey}`;
    return { uploadUrl, objectKey, publicUrl };
  }

  // 2. Custom Supabase Project Storage
  if (provider === 'supabase_custom') {
    if (!user.supabase_url || !user.supabase_service_role_key) {
      throw new Error('Custom Supabase URL or Service Role Key missing from user storage setup.');
    }
    const serviceRoleKey = decryptToken(user.supabase_service_role_key);
    const customSupabase = createClient(user.supabase_url, serviceRoleKey, {
      auth: { persistSession: false },
    });
    const bucket = user.s3_bucket_name || 'puffiflow-videos';
    const { data, error } = await customSupabase.storage.from(bucket).createSignedUploadUrl(objectKey, { upsert: true });

    if (error || !data) {
      console.error(`[Custom Supabase Storage Error] Failed to create signed upload URL for ${objectKey}:`, error);
      throw new Error(`Failed to generate custom Supabase upload URL: ${error?.message || 'Unknown error'}`);
    }

    const uploadUrl = data.signedUrl;
    const publicUrl = `${user.supabase_url.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${objectKey}`;
    return { uploadUrl, objectKey, publicUrl };
  }

  // 3. Cloudflare R2
  if (provider === 'cloudflare_r2') {
    const creds = await getUserR2Credentials(userId);
    const client = getS3Client(creds.accountId, creds.accessKeyId, creds.secretAccessKey);

    const command = new PutObjectCommand({
      Bucket: creds.bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 1800 });
    const publicUrl = `${creds.publicDomain.replace(/\/$/, '')}/${objectKey}`;
    return { uploadUrl, objectKey, publicUrl };
  }

  // 4. AWS S3, Backblaze B2, Wasabi, or Generic S3 Compatible Storage
  if (!user.s3_access_key || !user.s3_secret_key) {
    throw new Error(`Incomplete S3 storage credentials for provider ${provider}.`);
  }

  const accessKeyId = decryptToken(user.s3_access_key);
  const secretAccessKey = decryptToken(user.s3_secret_key);
  const bucketName = user.s3_bucket_name || 'puffiflow-videos';
  let endpoint = user.s3_endpoint || undefined;
  let region = user.s3_region || 'us-east-1';

  if (provider === 'backblaze_b2' && !endpoint) {
    endpoint = 'https://s3.us-west-004.backblazeb2.com';
    region = region || 'us-west-004';
  } else if (provider === 'wasabi' && !endpoint) {
    endpoint = 'https://s3.wasabisys.com';
    region = region || 'us-east-1';
  }

  const client = getGenericS3Client(endpoint, region, accessKeyId, secretAccessKey);
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 1800 });

  let publicUrl = user.r2_public_domain ? user.r2_public_domain.replace(/\/$/, '') : '';
  if (!publicUrl) {
    if (endpoint) {
      publicUrl = `${endpoint.replace(/\/$/, '')}/${bucketName}/${objectKey}`;
    } else {
      publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;
    }
  } else {
    publicUrl = `${publicUrl}/${objectKey}`;
  }

  return { uploadUrl, objectKey, publicUrl };
}

// Alias for backward compatibility
export const generateR2PresignedUrl = generatePresignedUploadUrl;
