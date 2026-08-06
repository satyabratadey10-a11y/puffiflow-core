'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cloud, ExternalLink, Key, Database, ShieldCheck, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Info } from 'lucide-react';
import { verifyStorageSetup, getStorageStatus } from '../../../lib/api-client';

export default function StorageSetupPage() {
  const [userId, setUserId] = useState<string>('usr_demo_1001');
  const [accountId, setAccountId] = useState('');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [bucketName, setBucketName] = useState('');
  const [publicDomain, setPublicDomain] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(false);
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
          if (st.bucketName) setBucketName(st.bucketName);
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

  const handleTestAndSave = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      console.error('[Storage Setup Error]:', err);
      setErrorMsg(err.message || 'Failed to verify Cloudflare R2 bucket connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard?userId=${userId}`}
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <a
          href="https://dash.cloudflare.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30 text-xs font-semibold transition-all"
        >
          <span>Open Cloudflare R2 Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Container Header */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cloud className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Bring Your Own Storage (BYOS)</h1>
            <p className="text-slate-400 text-sm mt-1">
              Connect your free Cloudflare R2 bucket for zero-egress direct S3 uploads and 4K upscaled video hosting.
            </p>
          </div>
        </div>

        {setupCompleted && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold">Storage Setup Active & Validated (Bucket: {bucketName})</span>
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

      {/* Step-by-Step R2 Setup Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 mb-3 inline-block">Step 1</span>
          <h3 className="text-white font-bold text-base mb-2">Create R2 Bucket</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Log into <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Cloudflare Portal</a>, navigate to <strong>R2 Object Storage</strong>, and click <em>Create Bucket</em> (e.g. <code>puffiflow-videos</code>).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-400 mb-3 inline-block">Step 2</span>
          <h3 className="text-white font-bold text-base mb-2">Generate S3 API Tokens</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Click <strong>Manage R2 API Tokens</strong>, select <em>Create API Token</em> with <strong>Object Read & Write</strong> permissions, and copy your Account ID, Access Key ID, and Secret Access Key.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 mb-3 inline-block">Step 3</span>
          <h3 className="text-white font-bold text-base mb-2">Enable Public Access</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Under bucket settings, enable <strong>Public Access</strong> or attach a Custom Domain (e.g. <code>pub-xxx.r2.dev</code>) so YouTube API can stream upscaled videos directly.
          </p>
        </div>
      </div>

      {/* R2 Credentials Form */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Key className="w-5 h-5 text-cyan-400" />
          <span>Cloudflare R2 Connection Credentials</span>
        </h2>

        <form onSubmit={handleTestAndSave} className="space-y-6">
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
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
              <Info className="w-3.5 h-3.5" />
              <span>If left blank, defaults to standard Cloudflare R2 bucket endpoint.</span>
            </p>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
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
  );
}
