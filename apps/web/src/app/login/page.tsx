'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, ArrowRight, LogIn, Loader2 } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailChecking, setEmailChecking] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailExists, setEmailExists] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Debounced email existence check (500ms)
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setEmailChecked(false);
      setEmailExists(true);
      return;
    }

    const timer = setTimeout(async () => {
      setEmailChecking(true);
      try {
        const { data, error } = await supabase.rpc('email_exists', { check_email: email.trim() });
        if (!error && typeof data === 'boolean') {
          setEmailExists(data);
          setEmailChecked(true);
        }
      } catch (err) {
        console.error('Failed to check email existence:', err);
      } finally {
        setEmailChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error('Incorrect email or password.');
        return;
      }

      toast.success('Successfully logged in!');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://puffiflow-core-web-t8e1.vercel.app';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) toast.error(error.message);
    } catch (err: any) {
      toast.error(err.message || 'Google sign in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-white relative">
      {/* Slow-floating ambient background gradient sphere */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-[#E3FDFD] via-[#CBF1F5] to-[#A6E3E9] rounded-full blur-[120px] pointer-events-none animate-blob" />

      <div className="w-full max-w-md p-8 rounded-2xl liquid-glass-card shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9] text-xs font-bold uppercase tracking-wider mb-2">
            <LogIn className="w-3.5 h-3.5 text-[#71C9CE]" />
            <span>Welcome Back</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Log in to PuffiFlow</h1>
          <p className="text-slate-600 text-xs md:text-sm">Manage 4K video upscaling & scheduled publishing</p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-[#A6E3E9] text-slate-800 font-bold text-sm transition-all flex items-center justify-center space-x-3 shadow-sm"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.3-1.4-.3-2.2z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
          )}
          <span>Sign in with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#A6E3E9] w-full" />
          <span className="bg-white px-3 text-xs text-slate-500 uppercase font-bold relative">Or Email</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 shadow-sm transition-colors"
              />
              {emailChecking && <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3.5 top-3.5" />}
            </div>

            {/* Inline Email Not Found Check */}
            {emailChecked && !emailExists && (
              <p className="text-xs text-amber-700 font-medium mt-1.5 flex items-center justify-between">
                <span>Email does not exist.</span>
                <Link href="/signup" className="underline font-bold hover:text-[#71C9CE]">Sign up instead?</Link>
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">Password</label>
              <Link href="/forgot-password" className="text-xs text-[#71C9CE] font-bold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 shadow-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-3.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-white bg-[#71C9CE] hover:bg-[#5ab5bb] shadow-lg shadow-[#71C9CE]/25 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs font-medium text-slate-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#71C9CE] font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
