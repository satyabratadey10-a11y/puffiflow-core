'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Cpu, Cloud, Youtube, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
      {/* Background Neon Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-violet-600/30 via-cyan-500/20 to-indigo-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" />

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/80 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>100% Serverless $0-Budget Stack</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.15]">
          Autonomous 4K Video Upscaling &{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-300 to-indigo-300">
            Scheduled YouTube Publishing
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300 font-normal leading-relaxed mb-10">
          Transform raw video assets into crystal-clear 4K (3840x2160) using Modal T4 GPU clusters, Cloudflare R2 direct S3 stream uploads, and automated YouTube Data API publishing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-xl shadow-violet-600/30 hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base text-slate-300 bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2 backdrop-blur-md"
          >
            <span>Explore Architecture</span>
          </a>
        </div>

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <Cpu className="w-6 h-6 text-violet-400 mb-2" />
            <h4 className="text-white font-semibold text-sm">Modal GPU Cluster</h4>
            <p className="text-slate-400 text-xs mt-1">Real-ESRGAN / FFmpeg 4K acceleration</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <Cloud className="w-6 h-6 text-cyan-400 mb-2" />
            <h4 className="text-white font-semibold text-sm">Cloudflare R2 Direct</h4>
            <p className="text-slate-400 text-xs mt-1">Zero-egress presigned S3 storage</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <Youtube className="w-6 h-6 text-red-400 mb-2" />
            <h4 className="text-white font-semibold text-sm">YouTube v3 OAuth</h4>
            <p className="text-slate-400 text-xs mt-1">Encrypted refresh token background publishing</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
            <h4 className="text-white font-semibold text-sm">Supabase PostgreSQL</h4>
            <p className="text-slate-400 text-xs mt-1">Structured state & automated CRON queue</p>
          </div>
        </div>
      </div>
    </section>
  );
}
