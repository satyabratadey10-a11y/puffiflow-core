import { JobRecord, VerifyStoragePayload } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getPresignedUploadUrl(
  userId: string,
  fileName: string,
  contentType: string,
  fileType: 'video' | 'thumbnail' = 'video'
): Promise<{
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
}> {
  const res = await fetch(`${API_BASE_URL}/api/upload/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, fileName, contentType, fileType }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get presigned upload URL. Ensure your Cloudflare R2 storage is configured.');
  }

  return res.json();
}

export async function uploadFileToR2(uploadUrl: string, file: File, onProgress?: (percent: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload to Cloudflare R2'));
    xhr.send(file);
  });
}

export async function verifyStorageSetup(payload: VerifyStoragePayload): Promise<{
  success: boolean;
  message: string;
  bucketName: string;
  publicDomain: string;
}> {
  const res = await fetch(`${API_BASE_URL}/api/storage/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.details || 'Failed to verify Cloudflare R2 credentials');
  }

  return res.json();
}

export async function getStorageStatus(userId: string): Promise<{
  storageSetupCompleted: boolean;
  bucketName: string | null;
  publicDomain: string | null;
}> {
  const res = await fetch(`${API_BASE_URL}/api/storage/status?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    return { storageSetupCompleted: false, bucketName: null, publicDomain: null };
  }
  const data = await res.json();
  return {
    storageSetupCompleted: !!data.storageSetupCompleted,
    bucketName: data.bucketName || null,
    publicDomain: data.publicDomain || null
  };
}

export async function createJob(payload: {
  userId: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  relatedVideoId?: string;
  aiEnhancerEnabled?: boolean;
  targetResolution?: '1080p' | '4K';
  rawVideoUrl: string;
  scheduledTime: string;
}): Promise<JobRecord> {
  const res = await fetch(`${API_BASE_URL}/api/jobs/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create job');
  }

  const data = await res.json();
  return data.job;
}

export async function getUserJobs(userId: string): Promise<JobRecord[]> {
  const res = await fetch(`${API_BASE_URL}/api/jobs?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch user jobs');
  }
  const data = await res.json();
  return data.jobs || [];
}

export async function getYoutubeAuthUrl(userId: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/auth/youtube/url?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch YouTube Auth URL');
  }
  const data = await res.json();
  return data.url;
}
