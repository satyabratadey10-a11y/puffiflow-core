'use client';

import React, { useState } from 'react';
import { Youtube, CheckCircle, AlertCircle, ExternalLink, RefreshCw, Tv } from 'lucide-react';
import { getYoutubeAuthUrl } from '../lib/api-client';

interface YoutubeAuthCardProps {
  userId: string;
  isYoutubeConnected: boolean;
  channelTitle?: string | null;
  channelId?: string | null;
}

export default function YoutubeAuthCard({
  userId,
  isYoutubeConnected,
  channelTitle,
  channelId,
}: YoutubeAuthCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectYoutube = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await getYoutubeAuthUrl(userId);
      window.location.href = url;
    } catch (err: any) {
      console.error('Failed to get YouTube Auth URL:', err);
      setError(err.message || 'Could not initiate YouTube authentication');
      setLoading(false);
    }
  };

  return (
    <div className="p-7 rounded-2xl liquid-glass-card space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-200 shadow-sm">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">YouTube Integration</h3>
            <p className="text-xs font-medium text-slate-500">OAuth v3 Encrypted Token</p>
          </div>
        </div>

        {isYoutubeConnected ? (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9] text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5 text-[#71C9CE]" />
            <span>Connected</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Disconnected</span>
          </span>
        )}
      </div>

      {!isYoutubeConnected ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-red-900">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>No Channel Linked</span>
          </div>
          <p className="leading-relaxed">
            Link your YouTube channel to grant background publishing permissions for 4K video uploads.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#E3FDFD] border border-[#A6E3E9] text-[#1e484c] text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold text-[#1e484c]">
            <Tv className="w-4 h-4 text-[#71C9CE] flex-shrink-0" />
            <span>Channel: {channelTitle || 'Connected Channel'}</span>
          </div>
          {channelId && <p className="text-[11px] text-[#5ab5bb] font-mono">ID: {channelId}</p>}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      <button
        onClick={handleConnectYoutube}
        disabled={loading}
        className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all shadow-md shadow-red-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Redirecting to Google...</span>
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            <span>{isYoutubeConnected ? 'Reconnect Channel' : 'Connect YouTube Account'}</span>
          </>
        )}
      </button>
    </div>
  );
}
