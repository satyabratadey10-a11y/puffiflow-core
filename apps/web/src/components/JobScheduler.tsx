'use client';

import React, { useState } from 'react';
import { Calendar, Sparkles, Loader2, CheckCircle2, Link2, Sliders, Image as ImageIcon, Video } from 'lucide-react';
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
      setError('Title, raw R2 video URL, and scheduled release date/time are required.');
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
    <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-600/20">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Create & Schedule Video Job</h3>
          <p className="text-xs text-slate-400">BYOS S3 Uploads, AI Quality Enhancements & YouTube Release</p>
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

      <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-slate-800">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Video Metadata & Release Options</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Video Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 4K Ultra HD Cyberpunk Cinematic Showcase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Related YouTube Video ID (Optional)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. dQw4w9WgXcQ (Links Short to Long video)"
                value={relatedVideoId}
                onChange={(e) => setRelatedVideoId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-violet-500 font-mono transition-colors"
              />
              <Link2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Description</label>
          <textarea
            rows={3}
            placeholder="Full video description for YouTube release..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* AI & Quality Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">AI Quality Enhancer</span>
              <span className="text-xs text-slate-400">Apply Real-ESRGAN GPU sharpening filter chain</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnhancerEnabled}
                onChange={(e) => setAiEnhancerEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-600 peer-checked:to-cyan-500"></div>
            </label>
          </div>

          <div>
            <span className="text-sm font-bold text-white block mb-2">Target Output Resolution</span>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setTargetResolution('1080p')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  targetResolution === '1080p'
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                1080p Full HD
              </button>
              <button
                type="button"
                onClick={() => setTargetResolution('4K')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  targetResolution === '4K'
                    ? 'bg-violet-500/20 text-violet-400 border-violet-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                4K Ultra HD (3840x2160)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Scheduled Release Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">R2 Raw Video Stream URL</label>
            <input
              type="url"
              readOnly
              value={rawVideoUrl}
              placeholder="Upload raw video above to populate R2 URL"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs font-mono"
            />
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !rawVideoUrl}
          className="w-full py-4 px-6 rounded-xl font-extrabold text-base text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all shadow-xl shadow-violet-600/30 flex items-center justify-center space-x-3 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Dispatching Modal GPU Job & Scheduling YouTube Release...</span>
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
