import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getUserById } from './supabase';
import { decryptToken } from './crypto';
import { DecryptedUserR2Credentials } from '../types';

export function getS3Client(accountId: string, accessKeyId: string, secretAccessKey: string): S3Client {
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function getUserR2Credentials(userId: string): Promise<DecryptedUserR2Credentials> {
  const user = await getUserById(userId);
  if (!user || !user.storage_setup_completed) {
    throw new Error(`User ${userId} has not completed Cloudflare R2 storage setup. Please visit /dashboard/setup.`);
  }

  if (!user.r2_account_id || !user.r2_access_key_id || !user.r2_secret_access_key || !user.r2_bucket_name) {
    throw new Error('Incomplete R2 storage credentials found for user.');
  }

  const accountId = decryptToken(user.r2_account_id);
  const accessKeyId = decryptToken(user.r2_access_key_id);
  const secretAccessKey = decryptToken(user.r2_secret_access_key);
  const bucketName = user.r2_bucket_name;
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

export async function generateR2PresignedUrl(
  userId: string,
  filename: string,
  contentType: string,
  fileType: 'video' | 'thumbnail' = 'video'
): Promise<{ uploadUrl: string; objectKey: string; publicUrl: string }> {
  const creds = await getUserR2Credentials(userId);
  const client = getS3Client(creds.accountId, creds.accessKeyId, creds.secretAccessKey);

  const fileExt = filename.includes('.') ? filename.split('.').pop() : (fileType === 'thumbnail' ? 'jpg' : 'mp4');
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const prefix = fileType === 'thumbnail' ? 'thumbnails' : 'raw';
  const objectKey = `${prefix}/${uniqueId}.${fileExt}`;

  const command = new PutObjectCommand({
    Bucket: creds.bucketName,
    Key: objectKey,
    ContentType: contentType,
  });

  // Presigned PUT URL valid for 30 minutes (1800 seconds)
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 1800 });
  const publicUrl = `${creds.publicDomain.replace(/\/$/, '')}/${objectKey}`;

  return { uploadUrl, objectKey, publicUrl };
}
