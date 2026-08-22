'use client';

import React, { useState } from 'react';
import { UploadCloud, Cpu, ShieldCheck, Youtube, ArrowRight, Check, Activity, Terminal, Sparkles } from 'lucide-react';

export default function InteractivePipeline() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 'ingest',
      stepNumber: '01',
      title: 'Direct BYOS Upload',
      subtitle: 'Zero Server Disk Ingestion',
      icon: UploadCloud,
      badge: 'Presigned S3/R2 PUT (1800s)',
      color: '#71C9CE',
      description: 'Raw video stream is written directly from client browser into your configured Cloudflare R2 / AWS S3 / Supabase bucket without touching API server storage.',
      specs: [
        { label: 'Egress Bandwidth Fee', value: '$0.00 / GB' },
        { label: 'API Disk Footprint', value: '0.0 MB (Pure Stream)' },
        { label: 'Ingestion Latency', value: '~1.2s to presign' },
      ],
      codePayload: `{
  "action": "presigned_put_url",
  "provider": "cloudflare_r2",
  "bucket": "puffiflow-videos",
  "key": "raw/1723489201_demo.mp4",
  "expires_in": 1800
}`,
    },
    {
      id: 'gpu',
      stepNumber: '02',
      title: 'Modal T4 GPU Cluster',
      subtitle: 'Serverless Real-ESRGAN Inference',
      icon: Cpu,
      badge: '4x TensorRT Acceleration',
      color: '#5ab5bb',
      description: 'Modal serverless container spins up on demand, pulls raw stream directly from your S3 bucket, executes Real-ESRGAN neural enhancement, and encodes 4K 60FPS NVENC MP4.',
      specs: [
        { label: 'GPU Hardware', value: 'NVIDIA Tesla T4 (16GB VRAM)' },
        { label: 'Target Resolution', value: '3840 x 2160 (4K UHD)' },
        { label: 'Average Upscale Speed', value: '180 fps frame-batching' },
      ],
      codePayload: `{
  "worker": "modal_real_esrgan_t4",
  "job_id": "job_09a1bf82e",
  "scale": 4,
  "model": "RealESRGAN_x4plus",
  "output_container": "mp4_nvenc_h265"
}`,
    },
    {
      id: 'security',
      stepNumber: '03',
      title: 'Supabase PostgreSQL RLS',
      subtitle: 'AES-256 Token Vault & Queue',
      icon: ShieldCheck,
      badge: 'Encrypted Row Level Security',
      color: '#1e484c',
      description: 'Job execution states, scheduled timestamps, and encrypted OAuth tokens are stored in PostgreSQL with strict Row-Level Security and IDOR protection.',
      specs: [
        { label: 'Token Encryption', value: 'AES-256-GCM (IV + AuthTag)' },
        { label: 'State Access Control', value: 'PostgreSQL auth.uid() RLS' },
        { label: 'CRON Poller Frequency', value: 'Every 60 seconds' },
      ],
      codePayload: `{
  "table": "public.jobs",
  "status": "COMPLETED",
  "processed_4k_url": "https://pub-r2.dev/processed/4k_out.mp4",
  "scheduled_publish_time": "2026-08-22T18:00:00.000Z"
}`,
    },
    {
      id: 'publish',
      stepNumber: '04',
      title: 'YouTube Data API v3',
      subtitle: 'Automated Background Release',
      icon: Youtube,
      badge: 'OAuth2 Offline Stream',
      color: '#EA4335',
      description: 'When scheduled release time arrives, the background worker decrypts YouTube refresh token and dispatches 4K video asset and custom thumbnail to your YouTube channel.',
      specs: [
        { label: 'API Endpoint', value: 'youtube.videos.insert' },
        { label: 'Privacy Mode', value: 'Public / Unlisted / Scheduled' },
        { label: 'Asset Linking', value: 'Auto-Relate Shorts to Longs' },
      ],
      codePayload: `{
  "youtube_channel_id": "UC_x98b8c2810a91e",
  "snippet": {
    "title": "4K Ultra HD Showcase",
    "categoryId": "28"
  },
  "status": { "privacyStatus": "public" }
}`,
    },
  ];

  const current = steps[activeStep];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9] text-xs font-bold uppercase tracking-wider">
          <Activity className="w-4 h-4 text-[#71C9CE] animate-pulse" />
          <span>Interactive Architectural Pipeline</span>
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          How PuffiFlow Works Under the Hood
        </h3>
        <p className="text-slate-600 text-sm">
          Click through each stage to inspect live serverless data flows, cryptographic handshakes, and GPU telemetry.
        </p>
      </div>

      {/* Pipeline Step Stepper Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isSelected = activeStep === idx;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`p-5 rounded-2xl text-left btn-interactive border transition-all relative overflow-hidden flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-white border-[#71C9CE] shadow-xl shadow-[#71C9CE]/20 ring-2 ring-[#71C9CE]/50'
                  : 'bg-white/80 border-[#A6E3E9]/60 hover:bg-[#CBF1F5]/30'
              }`}
            >
              {/* Progress Indicator Accent */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A6E3E9] via-[#71C9CE] to-[#5ab5bb]" />
              )}

              <div className="flex items-center justify-between w-full">
                <div
                  className={`p-2.5 rounded-xl transition-colors ${
                    isSelected ? 'bg-[#CBF1F5] text-[#1e484c]' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[#71C9CE]' : ''}`} />
                </div>
                <span className="font-mono text-xs font-extrabold text-slate-400">STAGE {s.stepNumber}</span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{s.title}</h4>
                <p className="text-slate-500 text-xs mt-0.5">{s.subtitle}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#5ab5bb]">
                <span>{s.badge}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Card with Live Simulated Telemetry & Code Payload */}
      <div className="p-8 rounded-3xl liquid-glass-card shadow-2xl border border-[#A6E3E9] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        {/* Ambient Shimmer Background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#CBF1F5]/60 rounded-full blur-[90px] pointer-events-none" />

        {/* Left Column: Stage Specs & Overview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#71C9CE] to-[#A6E3E9] text-white shadow-lg shadow-[#71C9CE]/25">
              {React.createElement(current.icon, { className: 'w-6 h-6' })}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#71C9CE]">Stage {current.stepNumber} Deep Dive</span>
              <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{current.title}</h4>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">{current.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {current.specs.map((sp, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-[#E3FDFD]/50 border border-[#A6E3E9] space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{sp.label}</span>
                <span className="text-xs font-bold text-[#1e484c] font-mono block">{sp.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Simulated JSON Telemetry Stream */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-5 font-mono text-xs text-slate-300 space-y-3 relative overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-bold text-slate-300">telemetry_feed_{current.id}.json</span>
              </div>
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE</span>
              </span>
            </div>

            {/* Code Body */}
            <pre className="text-cyan-300 text-xs overflow-x-auto leading-relaxed py-2">
              <code>{current.codePayload}</code>
            </pre>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>Encrypted via AES-256</span>
              <span className="text-[#71C9CE]">STATUS: OK (200)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
