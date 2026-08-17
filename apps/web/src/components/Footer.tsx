import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#A6E3E9]/50 bg-white/80 backdrop-blur-lg py-12 px-6 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-[#71C9CE] to-[#A6E3E9] text-white shadow-md shadow-[#71C9CE]/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1e484c] via-[#5ab5bb] to-[#71C9CE]">
              PuffiFlow
            </span>
            <p className="text-xs text-slate-500">Autonomous 4K Video Upscaling & Scheduled YouTube Publishing</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs font-bold text-slate-700">
          <Link href="/#features" className="hover:text-[#5ab5bb] transition-colors">
            Architecture
          </Link>
          <Link href="/dashboard/setup" className="hover:text-[#5ab5bb] transition-colors">
            BYOS Storage Setup
          </Link>
          <Link href="/dashboard" className="hover:text-[#5ab5bb] transition-colors">
            Workspace Console
          </Link>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#71C9CE]" />
          <span>© {new Date().getFullYear()} PuffiFlow Core. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
