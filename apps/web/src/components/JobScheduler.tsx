'use client';

import React, { useState } from 'react';
import { Calendar, Sparkles, Loader2, CheckCircle2, Link2, Sliders } from 'lucide-react';
import { createJob } from '../lib/api-client';
import DirectR2Upload from './DirectR2Upload';

interface JobSchedulerProps {
  userId: string;
  onJobScheduled: () => void;
}

export default function JobScheduler({ userId, onJobScheduled }: JobSchedulerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rawVideoUrl, setRawVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [relatedVideoId, setRelatedVideoId] = useState('');
  const [aiEnhancerEnabled, setAiEnhancerEnabled] = useState(true);
  const [targetResolution, setTargetResolution] = useState<'1080p' | '4K'>('4K');
  const [scheduledTime, setScheduledTime] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !rawVideoUrl || !scheduledTime) {
      setError('Title, raw video URL, and scheduled release date/time are required.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await createJob({
        userId,
        title,
        description,
        thumbnailUrl: thumbnailUrl || undefined,
        relatedVideoId: relatedVideoId || undefined,
        aiEnhancerEnabled,
        targetResolution,
        rawVideoUrl,
        scheduledTime: new Date(scheduledTime).toISOString(),
      });

      setSuccessMsg(`Job dispatched! AI Upscaling (${targetResolution}) & YouTube publish scheduled.`);
      setTitle('');
      setDescription('');
      setRawVideoUrl('');
      setThumbnailUrl('');
      setRelatedVideoId('');
      setScheduledTime('');
      onJobScheduled();
    } catch (err: any) {
      console.error('[Job Scheduler Error]:', err);
      setError(err.message || 'Failed to submit upscaling & scheduling job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-2xl liquid-glass-card space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">Create & Schedule Video Job</h3>
          <p className="text-xs font-medium text-slate-500">BYOS S3 Uploads, AI Quality Enhancements & YouTube Release</p>
        </div>
      </div>

      {/* Step A: S3 Upload Components for Video & Optional Thumbnail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DirectR2Upload
          userId={userId}
          fileType="video"
          label="1. Raw Video Binary (.mp4)"
          onUploadSuccess={(url) => setRawVideoUrl(url)}
        />
        <DirectR2Upload
          userId={userId}
          fileType="thumbnail"
          label="2. Custom Thumbnail (Optional)"
          onUploadSuccess={(url) => setThumbnailUrl(url)}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-slate-200/80">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <span>Video Metadata & Release Options</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Video Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 4K Ultra HD Cyberpunk Cinematic Showcase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Related YouTube Video ID (Optional)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. dQw4w9WgXcQ (Links Short to Long video)"
                value={relatedVideoId}
                onChange={(e) => setRelatedVideoId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-mono shadow-sm transition-colors"
              />
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">Description</label>
          <textarea
            rows={3}
            placeholder="Full video description for YouTube release..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-sm transition-colors"
          />
        </div>

        {/* AI & Quality Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-900 block">AI Quality Enhancer</span>
              <span className="text-xs text-slate-500">Apply Real-ESRGAN GPU sharpening filter chain</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnhancerEnabled}
                onChange={(e) => setAiEnhancerEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-cyan-500"></div>
            </label>
          </div>

          <div>
            <span className="text-sm font-bold text-slate-900 block mb-2">Target Output Resolution</span>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setTargetResolution('1080p')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  targetResolution === '1080p'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                1080p Full HD
              </button>
              <button
                type="button"
                onClick={() => setTargetResolution('4K')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  targetResolution === '4K'
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                4K Ultra HD (3840x2160)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Scheduled Release Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Presigned Storage Stream URL</label>
            <input
              type="url"
              readOnly
              value={rawVideoUrl}
              placeholder="Upload raw video above to populate stream URL"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-mono"
            />
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !rawVideoUrl}
          className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Dispatching Modal GPU Job & Scheduling Release...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Dispatch AI Upscaling & Schedule YouTube Release</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
