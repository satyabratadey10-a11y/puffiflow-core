'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Cpu, Cloud, Youtube, ShieldCheck, Play, CheckCircle2, Zap } from 'lucide-react';
import InteractiveComparison from './InteractiveComparison';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 bg-white">
      {/* Slow-floating ambient liquid gradient background spheres */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#E3FDFD] via-[#CBF1F5] to-[#A6E3E9] blur-[140px] rounded-full pointer-events-none animate-blob" />
      <div className="absolute top-60 right-10 w-[420px] h-[420px] bg-[#CBF1F5]/70 rounded-full blur-[110px] pointer-events-none animate-blob-delay-2000" />
      <div className="absolute bottom-20 left-10 w-[420px] h-[420px] bg-[#E3FDFD]/90 rounded-full blur-[110px] pointer-events-none animate-blob-delay-4000" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        {/* Top Text & Headings */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Animated Pill Badge */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-[#CBF1F5]/80 border border-[#A6E3E9] text-[#1e484c] text-xs font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md animate-float">
            <span className="w-2.5 h-2.5 rounded-full bg-[#71C9CE] animate-ping" />
            <span>100% Serverless $0-Budget Multi-Cloud Stack</span>
            <Sparkles className="w-4 h-4 text-[#71C9CE]" />
          </div>

          {/* Main Headline with Negative Tracking */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight md:tracking-[-0.035em] text-slate-900 leading-[1.12]">
            Autonomous 4K Upscaling &{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e484c] via-[#5ab5bb] to-[#71C9CE] drop-shadow-sm">
              YouTube Publishing
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-600 font-normal leading-relaxed">
            Direct-to-storage presigned uploads (Cloudflare R2, AWS, Supabase, Backblaze, Wasabi), serverless Modal T4 Real-ESRGAN GPU upscaling, and automated scheduled YouTube Data API releases.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base text-white bg-[#71C9CE] hover:bg-[#5ab5bb] shadow-xl shadow-[#71C9CE]/35 btn-interactive flex items-center justify-center space-x-3 glow-border"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-[#1e484c] bg-[#CBF1F5] border border-[#A6E3E9] shadow-md shadow-[#71C9CE]/15 hover:bg-[#A6E3E9] btn-interactive flex items-center justify-center space-x-2 backdrop-blur-md"
            >
              <Play className="w-4 h-4 text-[#71C9CE] fill-current" />
              <span>Watch Live Demo</span>
            </a>
          </div>

          {/* Telemetry Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/70 border border-[#A6E3E9]/70 shadow-sm backdrop-blur-md">
              <span className="text-2xl font-extrabold text-[#1e484c] font-mono block">3840x2160</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target 4K 60FPS</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-[#A6E3E9]/70 shadow-sm backdrop-blur-md">
              <span className="text-2xl font-extrabold text-[#71C9CE] font-mono block">$0.00</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Egress Fees (R2)</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-[#A6E3E9]/70 shadow-sm backdrop-blur-md">
              <span className="text-2xl font-extrabold text-[#5ab5bb] font-mono block">3.4s</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">T4 GPU Latency</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-[#A6E3E9]/70 shadow-sm backdrop-blur-md">
              <span className="text-2xl font-extrabold text-[#1e484c] font-mono block">AES-256</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">OAuth Encryption</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Before / After Split Slider Showcase */}
        <div id="demo" className="pt-4 max-w-5xl mx-auto">
          <InteractiveComparison />
        </div>
      </div>
    </section>
  );
}
