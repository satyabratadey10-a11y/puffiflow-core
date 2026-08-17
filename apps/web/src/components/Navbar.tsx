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
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-[#A6E3E9]/50 shadow-sm shadow-[#71C9CE]/10 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-[#71C9CE] to-[#A6E3E9] group-hover:scale-105 transition-transform duration-200 shadow-md shadow-[#71C9CE]/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1e484c] via-[#5ab5bb] to-[#71C9CE]">
              PuffiFlow
            </span>
            <span className="ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9]">
              4K AI Core
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-700">
          <Link href="/#features" className="hover:text-[#5ab5bb] transition-colors flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-[#71C9CE]" />
            <span>Architecture</span>
          </Link>
          <Link href="/dashboard/setup" className="hover:text-[#5ab5bb] transition-colors flex items-center space-x-1.5">
            <Cloud className="w-4 h-4 text-[#71C9CE]" />
            <span>BYOS Storage</span>
          </Link>
          <Link href="/dashboard" className="hover:text-[#5ab5bb] transition-colors flex items-center space-x-1.5">
            <Video className="w-4 h-4 text-[#71C9CE]" />
            <span>Upscale & Publish</span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-2xl font-bold text-xs text-[#1e484c] bg-[#CBF1F5]/80 border border-[#A6E3E9] hover:bg-[#A6E3E9] transition-all flex items-center space-x-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#71C9CE]" />
                <span className="max-w-[120px] truncate font-medium">{user.email}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3.5 py-2 rounded-2xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 transition-colors flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-2xl font-bold text-xs text-[#1e484c] bg-[#CBF1F5] hover:bg-[#A6E3E9] border border-[#A6E3E9] transition-all flex items-center space-x-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-[#71C9CE]" />
                <span>Log In</span>
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-2xl font-bold text-xs text-white bg-[#71C9CE] hover:bg-[#5ab5bb] shadow-md shadow-[#71C9CE]/30 transition-all hover:scale-105"
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
