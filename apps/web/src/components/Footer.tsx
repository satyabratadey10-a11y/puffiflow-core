import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-lg py-12 px-6 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
              PuffiFlow
            </span>
            <p className="text-xs text-slate-500">Autonomous 4K Video Upscaling & Scheduled YouTube Publishing</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs font-semibold text-slate-600">
          <Link href="/#features" className="hover:text-emerald-600 transition-colors">
            Architecture
          </Link>
          <Link href="/dashboard/setup" className="hover:text-emerald-600 transition-colors">
            BYOS Storage Setup
          </Link>
          <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
            Workspace Console
          </Link>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>© {new Date().getFullYear()} PuffiFlow Core. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
