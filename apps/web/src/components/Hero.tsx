'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Cpu, Cloud, Youtube, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-28 bg-white">
      {/* Slow-floating ambient liquid gradient background spheres */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-[#E3FDFD] via-[#CBF1F5] to-[#A6E3E9] blur-[130px] rounded-full pointer-events-none animate-blob" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-[#CBF1F5]/60 rounded-full blur-[100px] pointer-events-none animate-blob-delay-2000" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#E3FDFD]/80 rounded-full blur-[100px] pointer-events-none animate-blob-delay-4000" />

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#CBF1F5] border border-[#A6E3E9] text-[#1e484c] text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#71C9CE] animate-pulse" />
          <span>100% Serverless $0-Budget Multi-Cloud Stack</span>
        </div>

        {/* Heading with size-specific optical tracking */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight md:tracking-[-0.03em] text-slate-900 mb-8 leading-[1.15]">
          Autonomous 4K Video Upscaling &{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e484c] via-[#5ab5bb] to-[#71C9CE]">
            Scheduled YouTube Publishing
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 font-normal leading-relaxed mb-10">
          Transform raw video assets into crystal-clear 4K (3840x2160) using Modal T4 GPU clusters, multi-cloud BYOS presigned uploads (Supabase, Cloudflare R2, AWS, Backblaze B2, Wasabi), and automated YouTube Data API publishing.
        </p>

        {/* Action Buttons with tactile press states */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-white bg-[#71C9CE] hover:bg-[#5ab5bb] shadow-xl shadow-[#71C9CE]/30 btn-interactive flex items-center justify-center space-x-3"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-[#1e484c] bg-[#CBF1F5] border border-[#A6E3E9] shadow-md shadow-[#71C9CE]/10 hover:bg-[#A6E3E9] btn-interactive flex items-center justify-center space-x-2 backdrop-blur-md"
          >
            <span>Explore Architecture</span>
          </a>
        </div>

        {/* Glassmorphic Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto text-left">
          <div className="p-6 rounded-2xl liquid-glass-card hover:-translate-y-1 hover:border-[#71C9CE] transition-all duration-200">
            <div className="p-3 rounded-xl bg-[#CBF1F5] text-[#1e484c] w-fit mb-3 border border-[#A6E3E9]">
              <Cpu className="w-6 h-6 text-[#71C9CE]" />
            </div>
            <h4 className="text-slate-900 font-bold text-base">Modal GPU Cluster</h4>
            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">Real-ESRGAN & FFmpeg 4K acceleration</p>
          </div>

          <div className="p-6 rounded-2xl liquid-glass-card hover:-translate-y-1 hover:border-[#71C9CE] transition-all duration-200">
            <div className="p-3 rounded-xl bg-[#CBF1F5] text-[#1e484c] w-fit mb-3 border border-[#A6E3E9]">
              <Cloud className="w-6 h-6 text-[#71C9CE]" />
            </div>
            <h4 className="text-slate-900 font-bold text-base">Universal BYOS</h4>
            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">Cloudflare R2, AWS, Backblaze B2 & Supabase</p>
          </div>

          <div className="p-6 rounded-2xl liquid-glass-card hover:-translate-y-1 hover:border-[#71C9CE] transition-all duration-200">
            <div className="p-3 rounded-xl bg-[#CBF1F5] text-[#1e484c] w-fit mb-3 border border-[#A6E3E9]">
              <Youtube className="w-6 h-6 text-red-500" />
            </div>
            <h4 className="text-slate-900 font-bold text-base">YouTube v3 OAuth</h4>
            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">Encrypted refresh token background publishing</p>
          </div>

          <div className="p-6 rounded-2xl liquid-glass-card hover:-translate-y-1 hover:border-[#71C9CE] transition-all duration-200">
            <div className="p-3 rounded-xl bg-[#CBF1F5] text-[#1e484c] w-fit mb-3 border border-[#A6E3E9]">
              <ShieldCheck className="w-6 h-6 text-[#71C9CE]" />
            </div>
            <h4 className="text-slate-900 font-bold text-base">Supabase PostgreSQL</h4>
            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">Structured state & automated CRON queue</p>
          </div>
        </div>
      </div>
    </section>
  );
}
