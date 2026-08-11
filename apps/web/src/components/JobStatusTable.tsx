'use client';

import React from 'react';
import { JobRecord } from '../types';
import { RefreshCw, PlayCircle, ExternalLink, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>QUEUED</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-bold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 text-cyan-600 animate-spin" />
            <span>GPU UPSCALING</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>4K READY</span>
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-extrabold shadow-sm">
            <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>PUBLISHED TO YT</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>FAILED</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 rounded-2xl liquid-glass-card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">Automation Job Execution History</h3>
          <p className="text-xs font-medium text-slate-500">Real-time status of serverless GPU upscaling & YouTube publishing queue</p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 rounded-2xl font-bold text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-50/70 border border-slate-200/80 text-slate-500 text-sm">
          No video upscaling jobs scheduled yet. Upload a video above to begin automated 4K processing.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 px-4">Title & Details</th>
                <th className="pb-3 px-4">Target Resolution</th>
                <th className="pb-3 px-4">Scheduled Release</th>
                <th className="pb-3 px-4">Current Status</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="bg-white hover:bg-slate-50/80 transition-colors border border-slate-200/80 rounded-2xl shadow-sm">
                  <td className="py-4 px-4 rounded-l-2xl">
                    <div className="font-bold text-slate-900">{job.title}</div>
                    {job.description && (
                      <div className="text-xs text-slate-500 truncate max-w-xs">{job.description}</div>
                    )}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-bold text-slate-700">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200">
                      {job.target_resolution || '4K'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-slate-600">
                    {new Date(job.scheduled_time).toLocaleString()}
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(job.status)}</td>
                  <td className="py-4 px-4 text-right rounded-r-2xl">
                    {job.processed_4k_url ? (
                      <a
                        href={job.processed_4k_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        <span>View 4K Asset</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Processing...</span>
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
