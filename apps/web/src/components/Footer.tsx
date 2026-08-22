import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Activity, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#A6E3E9]/60 bg-white/90 backdrop-blur-xl py-14 px-6 relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#A6E3E9]/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#71C9CE] to-[#A6E3E9] text-white shadow-md shadow-[#71C9CE]/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1e484c] via-[#5ab5bb] to-[#71C9CE]">
                PuffiFlow
              </span>
              <p className="text-xs text-slate-500 font-medium">Autonomous 4K Video Upscaling & Scheduled YouTube Publishing</p>
            </div>
          </div>

          {/* Real-Time Operational Health Badge */}
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9] text-xs font-mono font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Systems Operational • 99.99% Uptime</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-700">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/#features" className="hover:text-[#5ab5bb] transition-colors">
              Architecture
            </Link>
            <Link href="/#pipeline" className="hover:text-[#5ab5bb] transition-colors">
              Inference Pipeline
            </Link>
            <Link href="/dashboard/setup" className="hover:text-[#5ab5bb] transition-colors">
              BYOS Multi-Cloud
            </Link>
            <Link href="/dashboard" className="hover:text-[#5ab5bb] transition-colors">
              Automation Console
            </Link>
          </div>

          <div className="flex items-center space-x-2 text-slate-500 font-normal text-xs">
            <ShieldCheck className="w-4 h-4 text-[#71C9CE]" />
            <span>© {new Date().getFullYear()} PuffiFlow Core. Serverless 4K Automation.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
