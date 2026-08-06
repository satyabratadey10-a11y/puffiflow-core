'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Video, Calendar, ShieldCheck, Zap, Cloud } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-400 to-white">
              PuffiFlow
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              4K AI Core
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/#features" className="hover:text-cyan-400 transition-colors flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Architecture</span>
          </Link>
          <Link href="/dashboard/setup" className="hover:text-amber-400 transition-colors flex items-center space-x-1.5">
            <Cloud className="w-4 h-4 text-amber-400" />
            <span>BYOS Storage Setup</span>
          </Link>
          <Link href="/dashboard" className="hover:text-violet-400 transition-colors flex items-center space-x-1.5">
            <Video className="w-4 h-4 text-violet-400" />
            <span>Upscale & Publish</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Dashboard</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
