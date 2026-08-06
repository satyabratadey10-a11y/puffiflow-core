'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileVideo, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getPresignedUploadUrl, uploadFileToR2 } from '../lib/api-client';

interface DirectR2UploadProps {
  userId: string;
  fileType?: 'video' | 'thumbnail';
  label?: string;
  onUploadSuccess: (publicUrl: string) => void;
}

export default function DirectR2Upload({
  userId,
  fileType = 'video',
  label,
  onUploadSuccess
}: DirectR2UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isThumbnail = fileType === 'thumbnail';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setUploadedUrl(null);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // 1. Get Presigned S3 PUT URL using user's custom BYOS R2 credentials
      const presigned = await getPresignedUploadUrl(userId, file.name, file.type || (isThumbnail ? 'image/jpeg' : 'video/mp4'), fileType);

      // 2. Direct upload file binary to user's Cloudflare R2 bucket
      await uploadFileToR2(presigned.uploadUrl, file, (percent) => {
        setProgress(percent);
      });

      setUploadedUrl(presigned.publicUrl);
      onUploadSuccess(presigned.publicUrl);
    } catch (err: any) {
      console.error('[R2 Upload Error]:', err);
      setError(err.message || 'Direct upload to Cloudflare R2 failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2.5 rounded-xl border ${isThumbnail ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
          {isThumbnail ? <ImageIcon className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            {label || (isThumbnail ? 'Upload Custom Thumbnail' : 'Direct R2 S3 Video Upload')}
          </h3>
          <p className="text-xs text-slate-400">
            {isThumbnail ? 'Optional JPG/PNG thumbnail' : 'Zero-Egress Direct-to-Storage Pipeline'}
          </p>
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/50 rounded-2xl p-6 text-center transition-colors mb-4 bg-slate-950/50">
        <input
          type="file"
          accept={isThumbnail ? 'image/*' : 'video/*'}
          id={`r2FileInput_${fileType}`}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        <label htmlFor={`r2FileInput_${fileType}`} className="cursor-pointer block">
          {isThumbnail ? (
            <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2 group-hover:text-amber-400 transition-colors" />
          ) : (
            <FileVideo className="w-10 h-10 text-slate-400 mx-auto mb-2 group-hover:text-cyan-400 transition-colors" />
          )}
          <span className="text-sm font-semibold text-slate-200 block">
            {file ? file.name : (isThumbnail ? 'Click to select thumbnail image (.jpg, .png)' : 'Click to select raw video file (.mp4, .mov, .mkv)')}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Direct upload to your Cloudflare R2 bucket'}
          </span>
        </label>
      </div>

      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Uploading to custom R2 bucket...</span>
            <span className="font-bold text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-violet-500 h-2 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {uploadedUrl && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">R2 Public URL: {uploadedUrl}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading || !!uploadedUrl}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 ${
          isThumbnail
            ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/20'
            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/20'
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Streaming to R2 Storage...</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-4 h-4" />
            <span>{uploadedUrl ? 'Uploaded to R2' : `Start R2 ${isThumbnail ? 'Thumbnail' : 'Video'} Upload`}</span>
          </>
        )}
      </button>
    </div>
  );
}
