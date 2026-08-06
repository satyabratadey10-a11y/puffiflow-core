'use client';

import React from 'react';
import { JobRecord } from '../types';
import { RefreshCw, ExternalLink, Video, Clock, CheckCircle2, AlertTriangle, PlayCircle, Image as ImageIcon, Link2, Sparkles } from 'lucide-react';

interface JobStatusTableProps {
  jobs: JobRecord[];
  onRefresh: () => void;
  loading: boolean;
}

export default function JobStatusTable({ jobs, onRefresh, loading }: JobStatusTableProps) {
  const getStatusBadge = (status: JobRecord['status']) => {
    switch (status) {
      case 'QUEUED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
            <Clock className="w-3 h-3" />
            <span>QUEUED</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>PROCESSING (GPU)</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <PlayCircle className="w-3 h-3" />
            <span>PUBLISHED</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Job Execution History</h3>
            <p className="text-xs text-slate-400">Real-time status updates, resolution targets & YouTube links</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
          title="Refresh Job Table"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
          No video jobs found. Create your first upscaling & scheduling job above!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Metadata / Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Resolution / AI</th>
                <th className="py-3 px-4">Scheduled Release</th>
                <th className="py-3 px-4">Raw R2 Asset</th>
                <th className="py-3 px-4">Processed Asset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      {job.thumbnail_url ? (
                        <img
                          src={job.thumbnail_url}
                          alt="Custom Thumbnail"
                          className="w-12 h-8 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700 flex-shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="max-w-xs">
                        <span className="font-bold text-white block truncate">{job.title}</span>
                        {job.related_video_id && (
                          <span className="inline-flex items-center space-x-1 text-[11px] text-cyan-400">
                            <Link2 className="w-3 h-3" />
                            <span>Linked: {job.related_video_id}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(job.status)}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-mono font-bold">
                        {job.target_resolution || '4K'}
                      </span>
                      {job.ai_enhancer_enabled && (
                        <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-400" title="AI Enhancer Active">
                          <Sparkles className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                    {new Date(job.scheduled_time).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <a
                      href={job.raw_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Raw Stream</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-3.5 px-4">
                    {job.processed_4k_url ? (
                      <a
                        href={job.processed_4k_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-violet-400 hover:underline font-semibold flex items-center space-x-1"
                      >
                        <span>{job.target_resolution || '4K'} Stream</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-600">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
