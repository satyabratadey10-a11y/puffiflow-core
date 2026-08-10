'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import YoutubeAuthCard from '../../components/YoutubeAuthCard';
import JobScheduler from '../../components/JobScheduler';
import JobStatusTable from '../../components/JobStatusTable';
import { getUserJobs, getStorageStatus, getYoutubeStatus } from '../../lib/api-client';
import { JobRecord } from '../../types';
import { Sparkles, Video, AlertTriangle, ArrowRight, Cloud, Settings, Loader2 } from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const qUserId = searchParams.get('userId');
  const ytConnectedParam = searchParams.get('youtube_connected') || searchParams.get('youtubeConnected');

  const [userId, setUserId] = useState<string>(qUserId || 'usr_demo_1001');
  const [isYoutubeConnected, setIsYoutubeConnected] = useState<boolean>(false);
  const [channelTitle, setChannelTitle] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);

  const [storageSetupCompleted, setStorageSetupCompleted] = useState<boolean>(true);
  const [bucketName, setBucketName] = useState<string | null>(null);

  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false);

  useEffect(() => {
    if (qUserId) setUserId(qUserId);
  }, [qUserId]);

  // Handle YouTube OAuth success callback toast
  useEffect(() => {
    if (ytConnectedParam === 'true') {
      toast.success('YouTube Channel successfully linked!');
      setIsYoutubeConnected(true);
    }
  }, [ytConnectedParam]);

  // Fetch Storage & YouTube status
  useEffect(() => {
    async function checkStatus() {
      try {
        const st = await getStorageStatus(userId);
        setStorageSetupCompleted(st.storageSetupCompleted);
        setBucketName(st.bucketName);

        const ytSt = await getYoutubeStatus(userId);
        setIsYoutubeConnected(ytSt.connected);
        if (ytSt.channelTitle) setChannelTitle(ytSt.channelTitle);
        if (ytSt.channelId) setChannelId(ytSt.channelId);
      } catch (err) {
        console.error('Failed to check dashboard status:', err);
      }
    }
    checkStatus();
  }, [userId]);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const userJobs = await getUserJobs(userId);
      setJobs(userJobs);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Storage Setup Required Notification Banner */}
      {!storageSetupCompleted && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-base text-amber-200">Storage Setup Incomplete</h3>
              <p className="text-xs text-amber-300/80 mt-1">
                PuffiFlow operates on a Bring Your Own Storage (BYOS) model. Please configure your preferred storage provider before upscaling.
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/setup?userId=${userId}`}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center space-x-2 flex-shrink-0"
          >
            <span>Configure Storage</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BYOS Active Workspace</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">4K Automation Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Upload raw videos directly to your object storage, trigger serverless Modal T4 GPU upscaling, and automate YouTube publishing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={`/dashboard/setup?userId=${userId}`}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span>{bucketName ? `Bucket: ${bucketName}` : 'Storage Settings'}</span>
              <Settings className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </Link>

            <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono flex items-center justify-center space-x-2">
              <Video className="w-4 h-4 text-cyan-400" />
              <span>User ID: {userId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout for OAuth & Job Scheduler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <YoutubeAuthCard
            userId={userId}
            isYoutubeConnected={isYoutubeConnected}
            channelTitle={channelTitle}
            channelId={channelId}
          />
        </div>
        <div className="lg:col-span-2">
          <JobScheduler userId={userId} onJobScheduled={() => fetchJobs()} />
        </div>
      </div>

      {/* Real-Time Job Execution History Table */}
      <JobStatusTable jobs={jobs} onRefresh={fetchJobs} loading={loadingJobs} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-6 py-20 text-center text-slate-400 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-violet-400 mr-2" />
          <span>Loading 4K Automation Dashboard...</span>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
