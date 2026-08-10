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
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">YouTube Integration</h3>
            <p className="text-xs text-slate-400">OAuth v3 Encrypted Refresh Token</p>
          </div>
        </div>

        {isYoutubeConnected ? (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Connected</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Disconnected</span>
          </span>
        )}
      </div>

      {!isYoutubeConnected ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>No YouTube Channel Linked</span>
          </div>
          <p className="leading-relaxed">
            Link your YouTube channel to grant PuffiFlow background publishing permission for 4K video uploads.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold text-emerald-200">
            <Tv className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Channel: {channelTitle || 'Connected Channel'}</span>
          </div>
          {channelId && <p className="text-[11px] text-emerald-400/80 font-mono">ID: {channelId}</p>}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      <button
        onClick={handleConnectYoutube}
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Redirecting to Google Consent...</span>
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            <span>{isYoutubeConnected ? 'Reconnect YouTube Channel' : 'Connect YouTube Account'}</span>
          </>
        )}
      </button>
    </div>
  );
}
