'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileVideo, Image as ImageIcon } from 'lucide-react';
import { getPresignedUploadUrl, uploadFileToR2 } from '../lib/api-client';

interface DirectR2UploadProps {
  userId: string;
  fileType: 'video' | 'thumbnail';
  label: string;
  onUploadSuccess: (publicUrl: string) => void;
}

export default function DirectR2Upload({
  userId,
  fileType,
  label,
  onUploadSuccess,
}: DirectR2UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [completedUrl, setCompletedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setCompletedUrl(null);
      setProgress(0);
    }
  };

  const handleStartUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const presign = await getPresignedUploadUrl(userId, file.name, file.type, fileType);
      await uploadFileToR2(presign.uploadUrl, file, (percent) => setProgress(percent));
      
      setCompletedUrl(presign.publicUrl);
      onUploadSuccess(presign.publicUrl);
    } catch (err: any) {
      console.error('[Upload Error]:', err);
      setError(err.message || 'Upload failed. Please check your storage settings.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
      <div className="flex items-center space-x-2">
        {fileType === 'video' ? (
          <FileVideo className="w-5 h-5 text-emerald-600" />
        ) : (
          <ImageIcon className="w-5 h-5 text-cyan-600" />
        )}
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{label}</span>
      </div>

      <div className="space-y-3">
        <input
          type="file"
          accept={fileType === 'video' ? 'video/*' : 'image/*'}
          onChange={handleFileChange}
          disabled={uploading}
          className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white file:text-slate-800 file:shadow-sm hover:file:bg-slate-100 transition-all cursor-pointer"
        />

        {file && !completedUrl && (
          <button
            type="button"
            onClick={handleStartUpload}
            disabled={uploading}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading... ({progress}%)</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload to BYOS Storage</span>
              </>
            )}
          </button>
        )}

        {uploading && (
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {completedUrl && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate font-medium">Uploaded! Stream URL generated.</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
