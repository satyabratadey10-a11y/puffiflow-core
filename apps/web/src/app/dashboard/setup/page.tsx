'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cloud, ExternalLink, Key, Database, ShieldCheck, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Info, Sparkles, CreditCard } from 'lucide-react';
import { verifyStorageSetup, setupSupabaseStorage, getStorageStatus } from '../../../lib/api-client';
import { StorageProvider } from '../../../types';

export default function StorageSetupPage() {
  const [userId, setUserId] = useState<string>('usr_demo_1001');
  const [activeTab, setActiveTab] = useState<StorageProvider>('supabase');

  // Cloudflare R2 Inputs
  const [accountId, setAccountId] = useState('');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [bucketName, setBucketName] = useState('');
  const [publicDomain, setPublicDomain] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [activeProvider, setActiveProvider] = useState<StorageProvider>('supabase');
  const [activeBucket, setActiveBucket] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const qUserId = searchParams.get('userId');
      if (qUserId) setUserId(qUserId);
    }
  }, []);

  useEffect(() => {
    async function checkCurrentStatus() {
      setStatusLoading(true);
      try {
        const st = await getStorageStatus(userId);
        if (st.storageSetupCompleted) {
          setSetupCompleted(true);
          setActiveProvider(st.storageProvider);
          setActiveTab(st.storageProvider);
          if (st.bucketName) {
            setActiveBucket(st.bucketName);
            if (st.storageProvider === 'cloudflare_r2') {
              setBucketName(st.bucketName);
            }
          }
          if (st.publicDomain) setPublicDomain(st.publicDomain);
        }
      } catch (err) {
        console.error('Failed to check storage status:', err);
      } finally {
        setStatusLoading(false);
      }
    }
    checkCurrentStatus();
  }, [userId]);

  // Tab 1 Handler: Enable Supabase Storage
  const handleEnableSupabaseStorage = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await setupSupabaseStorage(userId);
      setSuccessMsg(res.message || 'Supabase Storage enabled successfully!');
      setSetupCompleted(true);
      setActiveProvider('supabase');
      setActiveBucket('puffiflow-videos');
    } catch (err: any) {
      console.error('[Supabase Setup Error]:', err);
      setErrorMsg(err.message || 'Failed to enable Supabase Storage.');
    } finally {
      setLoading(false);
    }
  };

  // Tab 2 Handler: Test & Save Cloudflare R2 Connection
  const handleTestAndSaveR2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      setErrorMsg('Account ID, Access Key ID, Secret Access Key, and Bucket Name are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await verifyStorageSetup({
        userId,
        accountId: accountId.trim(),
        accessKeyId: accessKeyId.trim(),
        secretAccessKey: secretAccessKey.trim(),
        bucketName: bucketName.trim(),
        publicDomain: publicDomain.trim(),
      });

      setSuccessMsg(res.message || 'Cloudflare R2 storage connection verified and saved!');
      setSetupCompleted(true);
      setActiveProvider('cloudflare_r2');
      setActiveBucket(bucketName.trim());
    } catch (err: any) {
      console.error('[R2 Storage Setup Error]:', err);
      setErrorMsg(err.message || 'Failed to verify Cloudflare R2 bucket connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard?userId=${userId}`}
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold transition-all"
        >
          <span>Open Supabase Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Container Header */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Dual Storage Architecture</h1>
            <p className="text-slate-400 text-sm mt-1">
              Choose between <strong>Supabase Storage</strong> ($0 budget, no credit card needed) or <strong>Cloudflare R2</strong> (zero egress fees for high volume).
            </p>
          </div>
        </div>

        {setupCompleted && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold">
                Active Provider: {activeProvider === 'supabase' ? 'Supabase Storage' : 'Cloudflare R2'} (Bucket: {activeBucket || 'puffiflow-videos'})
              </span>
            </div>
            <Link
              href={`/dashboard?userId=${userId}`}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
            >
              Go to Video Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Tabbed Storage Selector */}
      <div className="flex rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800 backdrop-blur-md max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('supabase')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'supabase'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>Supabase Storage (No CC Needed)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cloudflare_r2')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'cloudflare_r2'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Cloud className="w-4 h-4 text-cyan-300" />
          <span>Cloudflare R2 / S3 (CC Required)</span>
        </button>
      </div>

      {/* TAB 1: SUPABASE STORAGE */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          {/* Step-by-Step Supabase Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 mb-3 inline-block">Step 1</span>
              <h3 className="text-white font-bold text-base mb-2">Log into Supabase Dashboard</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">Supabase Dashboard</a> and navigate to the <strong>Storage</strong> tab in the sidebar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 mb-3 inline-block">Step 2</span>
              <h3 className="text-white font-bold text-base mb-2">Create Public Bucket</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click <em>New Bucket</em>, enter bucket name <code>puffiflow-videos</code>, and toggle <strong>Public bucket</strong> to ON so YouTube API can access upscaled videos.
              </p>
            </div>
          </div>

          {/* Action Box for Supabase */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Enable $0-Budget Supabase Storage</span>
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              Supabase Storage is included free in your Supabase project with zero credit card required. Presigned upload URLs will be issued directly through your Supabase API key.
            </p>

            {successMsg && activeProvider === 'supabase' && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && activeTab === 'supabase' && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleEnableSupabaseStorage}
              disabled={loading}
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-xl shadow-emerald-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enabling Supabase Storage...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save & Enable Supabase Storage</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CLOUDFLARE R2 / S3 */}
      {activeTab === 'cloudflare_r2' && (
        <div className="space-y-6">
          {/* Step-by-Step R2 Setup Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 mb-3 inline-block">Step 1</span>
              <h3 className="text-white font-bold text-base mb-2">Create R2 Bucket</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Log into <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Cloudflare Portal</a>, navigate to <strong>R2 Object Storage</strong>, and click <em>Create Bucket</em>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-400 mb-3 inline-block">Step 2</span>
              <h3 className="text-white font-bold text-base mb-2">Generate S3 API Tokens</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click <strong>Manage R2 API Tokens</strong>, create a token with <strong>Object Read & Write</strong> permissions, and copy credentials.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 mb-3 inline-block">Step 3</span>
              <h3 className="text-white font-bold text-base mb-2">Enable Public Access</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Under bucket settings, enable <strong>Public Access</strong> or attach a Custom Domain (e.g. <code>pub-xxx.r2.dev</code>).
              </p>
            </div>
          </div>

          {/* R2 Credentials Form */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <span>Cloudflare R2 Connection Credentials</span>
            </h2>

            <form onSubmit={handleTestAndSaveR2} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Cloudflare Account ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. a1b2c3d4e5f67890abcdef1234567890"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Bucket Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. puffiflow-myvideos"
                    value={bucketName}
                    onChange={(e) => setBucketName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Access Key ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8493021abcf..."
                    value={accessKeyId}
                    onChange={(e) => setAccessKeyId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Secret Access Key *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Public Domain / R2 Public URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://pub-xxxxxx.r2.dev or https://videos.mycustomdomain.com"
                  value={publicDomain}
                  onChange={(e) => setPublicDomain(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {successMsg && activeProvider === 'cloudflare_r2' && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && activeTab === 'cloudflare_r2' && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 shadow-xl shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying HeadBucket Connection...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Test & Save Connection</span>
                    </>
                  )}
                </button>

                <a
                  href="https://dash.cloudflare.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Open Cloudflare R2 Portal</span>
                  <ExternalLink className="w-4 h-4 text-orange-400" />
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
