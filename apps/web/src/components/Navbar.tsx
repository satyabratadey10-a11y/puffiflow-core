'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Video, Cloud, Zap, LogIn, LogOut, User } from 'lucide-react';
import { createClient } from '../lib/supabase/client';

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

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

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl font-semibold text-xs text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all flex items-center space-x-1.5"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3.5 py-2 rounded-xl font-semibold text-xs text-slate-300 bg-slate-900/80 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 transition-colors flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all flex items-center space-x-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Log In</span>
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/20 transition-all hover:scale-105"
              >
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
