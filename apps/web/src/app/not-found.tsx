import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-xl mx-auto text-center p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mx-auto mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wider mb-4 inline-block">
          404 - Page Not Found
        </span>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Lost in the 4K Stream?
        </h1>

        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8">
          The requested page could not be located on the PuffiFlow platform. Check the URL or return to the landing page.
        </p>

        <div className="flex items-center justify-center space-x-4">
          <Link
            href="/"
            className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-lg shadow-violet-600/25 transition-all flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Open Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
