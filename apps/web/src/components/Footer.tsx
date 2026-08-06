'use client';

import React from 'react';
import { Sparkles, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-10 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight">PuffiFlow Core</span>
          <span className="text-xs text-slate-500">© 2026 PuffiFlow Architecture. All rights reserved.</span>
        </div>

        <div className="flex items-center space-x-6">
          <span className="flex items-center space-x-1 text-xs text-slate-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>for $0-Budget Serverless Stack</span>
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
