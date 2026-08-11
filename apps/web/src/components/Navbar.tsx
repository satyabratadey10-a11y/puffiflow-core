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
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/70 shadow-sm shadow-slate-100/50 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 group-hover:scale-105 transition-transform duration-200 shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
              PuffiFlow
            </span>
            <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              4K AI Core
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <Link href="/#features" className="hover:text-emerald-600 transition-colors flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Architecture</span>
          </Link>
          <Link href="/dashboard/setup" className="hover:text-cyan-600 transition-colors flex items-center space-x-1.5">
            <Cloud className="w-4 h-4 text-cyan-500" />
            <span>BYOS Storage</span>
          </Link>
          <Link href="/dashboard" className="hover:text-teal-600 transition-colors flex items-center space-x-1.5">
            <Video className="w-4 h-4 text-teal-500" />
            <span>Upscale & Publish</span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-2xl font-semibold text-xs text-slate-800 bg-slate-100/90 border border-slate-200/80 hover:bg-slate-200/80 transition-all flex items-center space-x-1.5"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span className="max-w-[120px] truncate font-medium">{user.email}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3.5 py-2 rounded-2xl font-semibold text-xs text-slate-700 bg-slate-100/80 hover:bg-red-50 hover:text-red-600 border border-slate-200/80 transition-colors flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-2xl font-semibold text-xs text-slate-800 hover:text-slate-950 bg-slate-100/90 border border-slate-200/80 hover:bg-slate-200/80 transition-all flex items-center space-x-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>Log In</span>
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-md shadow-emerald-500/25 transition-all hover:scale-105"
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
