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
    <div className="min-h-screen bg-white relative py-10 px-6">
      {/* Slow-floating ambient liquid background gradient sphere */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/30 to-cyan-200/30 rounded-full blur-[120px] pointer-events-none animate-blob" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-teal-200/20 rounded-full blur-[100px] pointer-events-none animate-blob-delay-2000" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Storage Setup Required Notification Banner */}
        {!storageSetupCompleted && (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-lg backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-base text-amber-950">Storage Setup Incomplete</h3>
                <p className="text-xs text-amber-800 mt-1">
                  PuffiFlow operates on a Bring Your Own Storage (BYOS) model. Please configure your preferred storage provider before upscaling.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/setup?userId=${userId}`}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-500/20 flex items-center space-x-2 flex-shrink-0"
            >
              <span>Configure Storage</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Header Banner */}
        <div className="p-8 rounded-2xl liquid-glass-card border border-slate-200/80 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>BYOS Active Workspace</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">4K Automation Dashboard</h1>
              <p className="text-slate-600 text-sm mt-1">
                Upload raw videos directly to your object storage, trigger serverless Modal T4 GPU upscaling, and automate YouTube publishing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href={`/dashboard/setup?userId=${userId}`}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 shadow-sm flex items-center justify-center space-x-2 transition-colors"
              >
                <Cloud className="w-4 h-4 text-cyan-600" />
                <span>{bucketName ? `Bucket: ${bucketName}` : 'Storage Settings'}</span>
                <Settings className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </Link>

              <div className="px-4 py-2.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-700 font-mono font-bold flex items-center justify-center space-x-2">
                <Video className="w-4 h-4 text-emerald-600" />
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
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-6 py-20 text-center text-slate-500 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
          <span className="font-semibold text-sm">Loading 4K Automation Dashboard...</span>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
