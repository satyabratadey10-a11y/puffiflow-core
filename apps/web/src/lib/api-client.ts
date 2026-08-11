import { createClient } from './supabase/client';
import { JobRecord, VerifyStoragePayload, StorageProvider, YoutubeStatusResponse } from '../types';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const cleanApiBaseUrl = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
const API_BASE_URL = `${cleanApiBaseUrl}/api`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    // Graceful fallback for non-session states
  }

  return headers;
}

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
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/upload/presign`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, fileName, contentType, fileType }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get presigned upload URL. Ensure your storage is configured.');
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

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}

export async function setupSupabaseStorage(userId: string): Promise<{
  success: boolean;
  message: string;
  storageProvider: StorageProvider;
  bucketName: string;
}> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/storage/setup-supabase`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to enable Supabase Storage');
  }

  return res.json();
}

export async function setupMultiCloudStorage(payload: VerifyStoragePayload): Promise<{
  success: boolean;
  message: string;
  storageProvider: StorageProvider;
  bucketName: string;
  publicDomain?: string;
}> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/storage/setup`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save storage configuration');
  }

  return res.json();
}

export async function verifyStorageSetup(payload: VerifyStoragePayload): Promise<{
  success: boolean;
  message: string;
  storageProvider: StorageProvider;
  bucketName: string;
  publicDomain: string;
}> {
  return setupMultiCloudStorage({ ...payload, provider: payload.provider || 'cloudflare_r2' }) as any;
}

export async function getStorageStatus(userId: string): Promise<{
  storageSetupCompleted: boolean;
  storageProvider: StorageProvider;
  bucketName: string | null;
  publicDomain: string | null;
}> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/storage/status?userId=${encodeURIComponent(userId)}`, {
    headers,
  });
  if (!res.ok) {
    return { storageSetupCompleted: false, storageProvider: 'supabase_default', bucketName: null, publicDomain: null };
  }
  const data = await res.json();
  return {
    storageSetupCompleted: !!data.storageSetupCompleted,
    storageProvider: (data.storageProvider as StorageProvider) || 'supabase_default',
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
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/jobs/create`, {
    method: 'POST',
    headers,
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
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/jobs?userId=${encodeURIComponent(userId)}`, {
    headers,
  });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.jobs || [];
}

export async function getYoutubeAuthUrl(userId: string): Promise<string> {
  return `${API_BASE_URL}/auth/youtube?userId=${encodeURIComponent(userId)}`;
}

export async function getYoutubeStatus(userId: string): Promise<YoutubeStatusResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/youtube/status?userId=${encodeURIComponent(userId)}`, {
    headers,
  });
  if (!res.ok) {
    return { connected: false };
  }
  const data = await res.json();
  return {
    connected: !!data.connected,
    channelId: data.channelId || null,
    channelTitle: data.channelTitle || null,
  };
}
