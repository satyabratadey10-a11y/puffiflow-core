'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Cloud, Cpu, Youtube } from 'lucide-react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import InteractivePipeline from '../components/InteractivePipeline';
import InteractiveStorageMatrix from '../components/InteractiveStorageMatrix';
import LiveGpuTerminal from '../components/LiveGpuTerminal';
import FaqSection from '../components/FaqSection';

export default function Home() {
  return (
    <div className="space-y-0 bg-white overflow-hidden">
      {/* 1. Animated Hero with Interactive 4K Split Comparison */}
      <Hero />

      {/* 2. Interactive 4-Stage Architecture Pipeline */}
      <section id="pipeline" className="py-24 px-6 bg-gradient-to-b from-white via-[#E3FDFD]/20 to-white relative z-10 border-t border-[#A6E3E9]/40">
        <div className="max-w-7xl mx-auto">
          <InteractivePipeline />
        </div>
      </section>

      {/* 3. High-Performance Feature Matrix */}
      <Features />

      {/* 4. Universal Multi-Cloud BYOS Storage & Cost Calculator */}
      <section id="storage" className="py-24 px-6 bg-white relative z-10 border-t border-[#A6E3E9]/40">
        <div className="max-w-7xl mx-auto">
          <InteractiveStorageMatrix />
        </div>
      </section>

      {/* 5. Live Modal T4 GPU Terminal Sandbox */}
      <section id="terminal" className="py-24 px-6 bg-gradient-to-b from-white via-[#E3FDFD]/30 to-white relative z-10 border-t border-[#A6E3E9]/40">
        <div className="max-w-7xl mx-auto">
          <LiveGpuTerminal />
        </div>
      </section>

      {/* 6. Frequently Asked Questions */}
      <section id="faq" className="border-t border-[#A6E3E9]/40">
        <FaqSection />
      </section>

      {/* 7. Final High-Energy Animated Call To Action */}
      <section className="py-24 px-6 relative z-10 overflow-hidden bg-[#1e484c] text-white">
        {/* Animated Background Spheres */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#71C9CE]/20 rounded-full blur-[130px] pointer-events-none animate-blob" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#5ab5bb]/20 rounded-full blur-[100px] pointer-events-none animate-blob-delay-2000" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 text-cyan-200 border border-cyan-400/30 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#71C9CE]" />
            <span>Ready for Zero-Egress 4K Automation?</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight md:tracking-[-0.03em] leading-tight">
            Start Upscaling & Scheduling in Under 60 Seconds
          </h2>

          <p className="max-w-2xl mx-auto text-cyan-100/80 text-base md:text-lg font-normal leading-relaxed">
            Connect your Cloudflare R2 / S3 storage, link your YouTube channel with encrypted OAuth2, and dispatch 4K upscaling jobs effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-9 py-4 rounded-2xl font-extrabold text-base text-[#1e484c] bg-gradient-to-r from-[#CBF1F5] via-[#A6E3E9] to-[#71C9CE] hover:brightness-105 shadow-2xl shadow-[#71C9CE]/40 btn-interactive flex items-center justify-center space-x-3"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/dashboard/setup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-white bg-white/10 hover:bg-white/20 border border-white/20 shadow-lg btn-interactive flex items-center justify-center space-x-2 backdrop-blur-md"
            >
              <Cloud className="w-4 h-4 text-[#71C9CE]" />
              <span>Configure BYOS Storage</span>
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-cyan-200/80 font-mono">
            <span className="flex items-center space-x-1.5"><ShieldCheck className="w-4 h-4 text-[#71C9CE]" /><span>AES-256 Encrypted</span></span>
            <span className="flex items-center space-x-1.5"><Cpu className="w-4 h-4 text-[#71C9CE]" /><span>Modal Tesla T4</span></span>
            <span className="flex items-center space-x-1.5"><Youtube className="w-4 h-4 text-red-400" /><span>YouTube Data API v3</span></span>
          </div>
        </div>
      </section>
    </div>
  );
}
