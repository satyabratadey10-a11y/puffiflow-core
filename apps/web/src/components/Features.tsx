'use client';

import React from 'react';
import { Zap, Shield, Layers, Workflow, Database, PlayCircle, Cpu, Cloud, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'Modal T4 GPU Cluster (Real-ESRGAN)',
    tag: 'Hardware Acceleration',
    description: 'Serverless Real-ESRGAN and NVENC H.265 4K acceleration pipeline executing on-demand with zero idle compute costs.',
    metrics: '180 FPS Frame-Batching',
  },
  {
    icon: Cloud,
    title: 'Universal Multi-Cloud BYOS Storage',
    tag: 'Zero Egress Fees',
    description: 'Direct presigned uploads across Cloudflare R2, AWS S3, Supabase Storage, Backblaze B2, and Wasabi without server disk hops.',
    metrics: '$0.00 / GB Bandwidth with R2',
  },
  {
    icon: PlayCircle,
    title: 'Automated YouTube Data API v3',
    tag: 'Scheduled Publishing',
    description: 'Autonomous background CRON scheduler streaming 4K MP4 assets and custom thumbnails directly to your YouTube channel.',
    metrics: 'Auto-Relate Shorts to Longs',
  },
  {
    icon: Lock,
    title: 'AES-256-GCM Cryptographic Vault',
    tag: 'Security & RLS',
    description: 'All cloud credentials, S3 secrets, and YouTube OAuth2 refresh tokens are encrypted at rest with unique initialization vectors.',
    metrics: 'PostgreSQL Row-Level Security',
  },
  {
    icon: Layers,
    title: 'Dual Resolution & Custom Thumbnails',
    tag: 'Flexible Transcoding',
    description: 'Select either 1080p Full HD or 4K Ultra HD targets with automated thumbnail attachments and video metadata formatting.',
    metrics: '3840x2160 & 1920x1080',
  },
  {
    icon: Workflow,
    title: 'Zero Local Disk Footprint',
    tag: 'Pure In-Memory Streams',
    description: 'Binary data passes directly between object storage and publishing endpoints, preventing disk full crashes and memory leaks.',
    metrics: '0 MB API Disk Buffer',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-[#E3FDFD]/25 relative z-10">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9] text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-[#71C9CE]" />
            <span>High-Performance System Architecture</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight md:tracking-[-0.02em]">
            Engineered for High-Scale 4K Automation
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            A production-ready serverless stack combining high-performance GPU compute, multi-cloud object storage, and automated social publishing.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl liquid-glass-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#71C9CE] to-[#A6E3E9] text-white shadow-md shadow-[#71C9CE]/25 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9]">
                      {feat.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#1e484c] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mt-2">{feat.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#A6E3E9]/50 flex items-center justify-between text-xs font-mono font-bold text-[#5ab5bb]">
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#71C9CE]" />
                    <span>{feat.metrics}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
