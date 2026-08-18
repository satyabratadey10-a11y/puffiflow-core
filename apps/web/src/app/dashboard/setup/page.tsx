'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Cloud,
  ExternalLink,
  Key,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Server,
  Layers,
  HardDrive,
  Globe,
} from 'lucide-react';
import { setupMultiCloudStorage, getStorageStatus } from '../../../lib/api-client';
import { StorageProvider } from '../../../types';

const PROVIDER_OPTIONS: { id: StorageProvider; name: string; badge: string; desc: string; icon: any }[] = [
  {
    id: 'supabase_default',
    name: 'Supabase Free Default',
    badge: '1 GB Included ($0/mo)',
    desc: 'Default serverless storage included in your Supabase backend.',
    icon: Sparkles,
  },
  {
    id: 'supabase_custom',
    name: 'Custom Supabase (BYOS)',
    badge: 'Own Project URL',
    desc: 'Bring your own dedicated Supabase project URL and Service Role Key.',
    icon: Database,
  },
  {
    id: 'cloudflare_r2',
    name: 'Cloudflare R2',
    badge: 'Zero Egress Fees',
    desc: 'S3-compatible object storage with $0 egress bandwidth cost.',
    icon: Cloud,
  },
  {
    id: 'aws_s3',
    name: 'Amazon Web Services S3',
    badge: 'Enterprise Standard',
    desc: 'AWS Simple Storage Service with global edge regions.',
    icon: Server,
  },
  {
    id: 'backblaze_b2',
    name: 'Backblaze B2 Storage',
    badge: 'Cost-Effective S3',
    desc: 'High-performance cloud storage at 1/5th the cost of traditional S3.',
    icon: HardDrive,
  },
  {
    id: 'wasabi',
    name: 'Wasabi Hot Cloud Storage',
    badge: 'No Egress / API Charges',
    desc: 'Ultra-fast S3-compliant object storage with flat pricing.',
    icon: Layers,
  },
];

function MultiCloudStorageSetupForm() {
  const searchParams = useSearchParams();
  const qUserId = searchParams.get('userId');

  const [userId, setUserId] = useState<string>(qUserId || 'usr_demo_1001');
  const [selectedProvider, setSelectedProvider] = useState<StorageProvider>('supabase_default');

  // Input states
  const [accountId, setAccountId] = useState('');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [bucketName, setBucketName] = useState('puffiflow-videos');
  const [publicDomain, setPublicDomain] = useState('');

  const [s3Endpoint, setS3Endpoint] = useState('');
  const [s3Region, setS3Region] = useState('us-east-1');

  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [activeProvider, setActiveProvider] = useState<StorageProvider>('supabase_default');
  const [activeBucket, setActiveBucket] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (qUserId) setUserId(qUserId);
  }, [qUserId]);

  useEffect(() => {
    async function checkCurrentStatus() {
      try {
        const st = await getStorageStatus(userId);
        if (st.storageSetupCompleted) {
          setSetupCompleted(true);
          setActiveProvider(st.storageProvider);
          setSelectedProvider(st.storageProvider);
          if (st.bucketName) setActiveBucket(st.bucketName);
          if (st.publicDomain) setPublicDomain(st.publicDomain);
        }
      } catch (err) {
        console.error('Failed to fetch storage status:', err);
      } finally {
        setStatusLoading(false);
      }
    }
    checkCurrentStatus();
  }, [userId]);

  const handleSaveStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await setupMultiCloudStorage({
        userId,
        provider: selectedProvider,
        accountId: accountId.trim(),
        accessKeyId: accessKeyId.trim(),
        secretAccessKey: secretAccessKey.trim(),
        bucketName: bucketName.trim() || 'puffiflow-videos',
        publicDomain: publicDomain.trim(),
        s3Endpoint: s3Endpoint.trim(),
        s3Region: s3Region.trim(),
        supabaseUrl: supabaseUrl.trim(),
        supabaseServiceRoleKey: supabaseServiceRoleKey.trim(),
      });

      setSuccessMsg(res.message || 'Storage provider configured successfully!');
      setSetupCompleted(true);
      setActiveProvider(res.storageProvider || selectedProvider);
      setActiveBucket(res.bucketName || bucketName.trim());
    } catch (err: any) {
      console.error('[Multi-Cloud Setup Error]:', err);
      setErrorMsg(err.message || 'Failed to verify or save storage configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative py-10 px-6">
      {/* Slow-floating ambient background gradient sphere */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#E3FDFD] via-[#CBF1F5] to-[#A6E3E9] blur-[130px] rounded-full pointer-events-none animate-blob" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard?userId=${userId}`}
            className="inline-flex items-center space-x-2 text-sm font-bold text-slate-700 hover:text-[#5ab5bb] btn-interactive"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-[#CBF1F5] text-[#1e484c] hover:bg-[#A6E3E9] border border-[#A6E3E9] text-xs font-bold btn-interactive shadow-sm"
          >
            <span>Supabase Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Main Header Banner */}
        <div className="p-8 rounded-2xl liquid-glass-card shadow-xl relative overflow-hidden">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-2xl bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9]">
              <Globe className="w-8 h-8 text-[#71C9CE]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight md:tracking-[-0.02em]">Universal BYOS Multi-Cloud Architecture</h1>
              <p className="text-slate-600 text-sm mt-1">
                Select your preferred object storage provider: <strong>Supabase (Default/Custom)</strong>, <strong>Cloudflare R2</strong>, <strong>AWS S3</strong>, <strong>Backblaze B2</strong>, or <strong>Wasabi</strong>.
              </p>
            </div>
          </div>

          {setupCompleted && (
            <div className="mt-6 p-4 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] text-[#1e484c] text-sm flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#71C9CE] flex-shrink-0" />
                <span className="font-bold">
                  Active Provider: {PROVIDER_OPTIONS.find((p) => p.id === activeProvider)?.name || activeProvider} (Bucket: {activeBucket || 'puffiflow-videos'})
                </span>
              </div>
              <Link
                href={`/dashboard?userId=${userId}`}
                className="px-4 py-2 rounded-xl bg-[#71C9CE] hover:bg-[#5ab5bb] text-white text-xs font-bold btn-interactive shadow-sm"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Multi-Cloud Provider Cards Selector */}
        <div className="space-y-4">
          <label className="block text-sm font-extrabold text-slate-900">Select Object Storage Provider</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROVIDER_OPTIONS.map((prov) => {
              const IconComponent = prov.icon;
              const isSelected = selectedProvider === prov.id;
              return (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => {
                    setSelectedProvider(prov.id);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`p-5 rounded-2xl text-left btn-interactive border flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-white border-[#71C9CE] shadow-xl shadow-[#71C9CE]/15 ring-2 ring-[#71C9CE]/50'
                      : 'bg-white/80 border-[#A6E3E9]/60 hover:bg-[#CBF1F5]/30 hover:border-[#A6E3E9]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#CBF1F5] text-[#1e484c]' : 'bg-slate-100 text-slate-500'}`}>
                      <IconComponent className={`w-5 h-5 ${isSelected ? 'text-[#71C9CE]' : ''}`} />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E3FDFD] border border-[#A6E3E9] text-[#1e484c]">
                      {prov.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{prov.name}</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{prov.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration Form Box */}
        <div className="p-8 rounded-2xl liquid-glass-card shadow-xl space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Key className="w-5 h-5 text-[#71C9CE]" />
            <span>Configure {PROVIDER_OPTIONS.find((p) => p.id === selectedProvider)?.name}</span>
          </h2>

          {/* Dynamic Provider Form Inputs */}
          <form onSubmit={handleSaveStorage} className="space-y-6">
            {/* PROVIDER: SUPABASE DEFAULT */}
            {selectedProvider === 'supabase_default' && (
              <div className="p-6 rounded-2xl bg-[#E3FDFD]/40 border border-[#A6E3E9] space-y-3">
                <p className="text-slate-700 text-sm leading-relaxed">
                  Uses your main Supabase backend project storage bucket (<code>puffiflow-videos</code>). No additional API keys or credit card required.
                </p>
                <div className="text-xs text-[#1e484c] font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#71C9CE]" />
                  <span>100% Free Default Stack ($0 Budget)</span>
                </div>
              </div>
            )}

            {/* PROVIDER: SUPABASE CUSTOM */}
            {selectedProvider === 'supabase_custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Custom Supabase Project URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 font-mono shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Service Role Key *</label>
                  <input
                    type="password"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={supabaseServiceRoleKey}
                    onChange={(e) => setSupabaseServiceRoleKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 font-mono shadow-sm transition-colors"
                  />
                </div>
              </div>
            )}

            {/* PROVIDER: CLOUDFLARE R2 */}
            {selectedProvider === 'cloudflare_r2' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Cloudflare Account ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. a1b2c3d4e5f67890abcdef1234567890"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 font-mono shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">R2 Access Key ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8493021abcf..."
                    value={accessKeyId}
                    onChange={(e) => setAccessKeyId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 font-mono shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">R2 Secret Access Key *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 font-mono shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Bucket Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="puffiflow-videos"
                    value={bucketName}
                    onChange={(e) => setBucketName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 shadow-sm transition-colors"
                  />
                </div>
              </div>
            )}

            {/* PROVIDER: AWS S3 */}
            {selectedProvider === 'aws_s3' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">AWS Region *</label>
                  <input
                    type="text"
                    required
                    placeholder="us-east-1"
                    value={s3Region}
                    onChange={(e) => setS3Region(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Bucket Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="my-s3-video-bucket"
                    value={bucketName}
                    onChange={(e) => setBucketName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Access Key ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    value={accessKeyId}
                    onChange={(e) => setAccessKeyId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 font-mono shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Secret Access Key *</label>
                  <input
                    type="password"
                    required
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 font-mono shadow-sm transition-colors"
                  />
                </div>
              </div>
            )}

            {/* PROVIDER: BACKBLAZE B2 / WASABI / GENERIC S3 */}
            {(selectedProvider === 'backblaze_b2' || selectedProvider === 'wasabi') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    S3 Endpoint URL {selectedProvider === 'backblaze_b2' ? '(e.g. https://s3.us-west-004.backblazeb2.com)' : '(e.g. https://s3.wasabisys.com)'}
                  </label>
                  <input
                    type="url"
                    placeholder={selectedProvider === 'backblaze_b2' ? 'https://s3.us-west-004.backblazeb2.com' : 'https://s3.wasabisys.com'}
                    value={s3Endpoint}
                    onChange={(e) => setS3Endpoint(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 font-mono shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Region *</label>
                  <input
                    type="text"
                    required
                    placeholder={selectedProvider === 'backblaze_b2' ? 'us-west-004' : 'us-east-1'}
                    value={s3Region}
                    onChange={(e) => setS3Region(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Bucket Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="puffiflow-videos"
                    value={bucketName}
                    onChange={(e) => setBucketName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Access Key ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="Access Key ID"
                    value={accessKeyId}
                    onChange={(e) => setAccessKeyId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 font-mono shadow-sm transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-2">Secret Access Key *</label>
                  <input
                    type="password"
                    required
                    placeholder="Secret Access Key"
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 font-mono shadow-sm transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Optional Public CDN Domain for S3 Providers */}
            {selectedProvider !== 'supabase_default' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Public CDN Domain / Direct URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://cdn.mycompany.com or https://pub-xxx.r2.dev"
                  value={publicDomain}
                  onChange={(e) => setPublicDomain(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 shadow-sm transition-colors"
                />
              </div>
            )}

            {/* Toast Messages */}
            {successMsg && (
              <div className="p-4 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] text-[#1e484c] text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#71C9CE] flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white bg-[#71C9CE] hover:bg-[#5ab5bb] shadow-lg shadow-[#71C9CE]/25 btn-interactive flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying & Saving Connection...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save & Enable Storage</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function StorageSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-6 py-20 text-center text-slate-500 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#71C9CE] mr-2" />
          <span className="font-semibold text-sm">Loading multi-cloud storage console...</span>
        </div>
      }
    >
      <MultiCloudStorageSetupForm />
    </Suspense>
  );
}
