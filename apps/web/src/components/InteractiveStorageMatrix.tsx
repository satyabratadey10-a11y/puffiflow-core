'use client';

import React, { useState } from 'react';
import { Cloud, Database, HardDrive, Layers, Server, Sparkles, Check, DollarSign, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function InteractiveStorageMatrix() {
  const [videoCount, setVideoCount] = useState<number>(50);
  const [videoSizeGb, setVideoSizeGb] = useState<number>(4); // 4GB per 4K video

  const totalBandwidthGb = videoCount * videoSizeGb;

  // Cost calculations:
  // AWS S3 standard egress: ~$0.09/GB
  // Traditional Cloud CDN egress: ~$0.08/GB
  // Cloudflare R2: $0.00 egress
  // Supabase Free: $0.00 egress within limits
  const awsCost = (totalBandwidthGb * 0.09).toFixed(2);
  const cloudflareR2Cost = '0.00';
  const savings = Number(awsCost).toFixed(2);

  const providers = [
    {
      id: 'r2',
      name: 'Cloudflare R2',
      badge: 'Zero Egress Fees ($0)',
      icon: Cloud,
      features: ['S3 API Compatible', '$0 / GB Egress Bandwidth', 'Free Tier: 10GB / mo', 'Global Cloudflare Edge'],
      recommended: true,
    },
    {
      id: 'supabase',
      name: 'Supabase Storage',
      badge: 'Integrated Free Stack',
      icon: Sparkles,
      features: ['Built-in Database Auth', 'Direct Signed Uploads', 'Free Tier: 1GB Storage', 'PostgreSQL RLS Native'],
      recommended: false,
    },
    {
      id: 'aws',
      name: 'Amazon Web Services S3',
      badge: 'Enterprise Standard',
      icon: Server,
      features: ['Global AWS Regions', 'Multi-AZ Durability', 'Presigned PUT Support', 'IAM Fine-Grained Roles'],
      recommended: false,
    },
    {
      id: 'b2',
      name: 'Backblaze B2',
      badge: '1/5th S3 Cost',
      icon: HardDrive,
      features: ['S3 Compatible APIs', 'Flat Rate Inexpensive Storage', 'Fast Object Retrieval', 'Zero Lock-in'],
      recommended: false,
    },
    {
      id: 'wasabi',
      name: 'Wasabi Hot Cloud',
      badge: 'No Egress / API Fees',
      icon: Layers,
      features: ['Flat Monthly Rate', 'Zero API Request Fees', 'Fast Transfer Speeds', 'Immutable Buckets'],
      recommended: false,
    },
  ];

  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9] text-xs font-bold uppercase tracking-wider">
          <Cloud className="w-4 h-4 text-[#71C9CE]" />
          <span>Universal BYOS Multi-Cloud Matrix</span>
        </div>
        <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Bring Your Own Storage. Pay $0 In Bandwidth.
        </h3>
        <p className="text-slate-600 text-sm md:text-base">
          PuffiFlow never marks up storage or charges egress fees. Connect your existing Cloudflare R2, AWS, Supabase, Backblaze B2, or Wasabi buckets in 30 seconds.
        </p>
      </div>

      {/* Interactive Savings Calculator */}
      <div className="p-8 rounded-3xl liquid-glass-card shadow-2xl border border-[#A6E3E9] max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-6">
          <div>
            <h4 className="text-xl font-extrabold text-slate-900">Live Egress Cost Simulator</h4>
            <p className="text-xs text-slate-500 mt-1">Adjust monthly video release volume to view your zero-egress savings:</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Monthly 4K Videos: <strong>{videoCount} videos</strong></span>
                <span className="text-[#5ab5bb]">({totalBandwidthGb} GB Total Streamed)</span>
              </div>
              <input
                type="range"
                min={5}
                max={300}
                step={5}
                value={videoCount}
                onChange={(e) => setVideoCount(Number(e.target.value))}
                className="w-full h-2 bg-[#CBF1F5] rounded-lg appearance-none cursor-pointer accent-[#71C9CE]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Average 4K File Size: <strong>{videoSizeGb} GB</strong></span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={videoSizeGb}
                onChange={(e) => setVideoSizeGb(Number(e.target.value))}
                className="w-full h-2 bg-[#CBF1F5] rounded-lg appearance-none cursor-pointer accent-[#71C9CE]"
              />
            </div>
          </div>
        </div>

        {/* Savings Output Box */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-gradient-to-tr from-[#1e484c] to-[#5ab5bb] text-white shadow-xl text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#71C9CE]/20 rounded-full blur-2xl" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-200 block">PuffiFlow + R2 Egress Cost</span>
          <div className="text-4xl font-extrabold text-white font-mono">${cloudflareR2Cost}</div>
          <p className="text-[11px] text-cyan-100/90">
            vs. <span className="line-through text-red-300 font-bold">${awsCost}/mo</span> on traditional egress billing
          </p>
          <div className="pt-3 border-t border-cyan-400/30 text-xs font-bold text-emerald-300 flex items-center justify-center space-x-1">
            <span>You Save ~${savings} / month</span>
          </div>
        </div>
      </div>

      {/* 5 Provider Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((prov) => {
          const Icon = prov.icon;
          return (
            <div
              key={prov.id}
              className={`p-7 rounded-3xl liquid-glass-card flex flex-col justify-between space-y-6 relative overflow-hidden ${
                prov.recommended ? 'ring-2 ring-[#71C9CE] shadow-xl shadow-[#71C9CE]/15' : ''
              }`}
            >
              {prov.recommended && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-[#71C9CE] to-[#5ab5bb] text-white text-[10px] font-extrabold uppercase px-4 py-1 rounded-bl-2xl shadow-sm">
                  Recommended
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9]">
                    <Icon className="w-6 h-6 text-[#71C9CE]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900">{prov.name}</h4>
                    <span className="text-xs font-bold text-[#5ab5bb]">{prov.badge}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {prov.features.map((feat, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-slate-600">
                      <Check className="w-4 h-4 text-[#71C9CE] flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/dashboard/setup"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-[#1e484c] bg-[#CBF1F5] hover:bg-[#A6E3E9] border border-[#A6E3E9] btn-interactive flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Connect Provider</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#71C9CE]" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
