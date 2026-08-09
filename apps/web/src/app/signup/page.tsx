'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import zxcvbn from 'zxcvbn';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Check, X, Loader2 } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Live password criteria validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol;

  // Password strength meter using zxcvbn
  const strengthResult = password ? zxcvbn(password) : null;
  const score = strengthResult ? strengthResult.score : 0; // 0 to 4

  const getStrengthLabel = (s: number) => {
    switch (s) {
      case 0: return { label: 'Very Weak', color: 'bg-red-500', text: 'text-red-400' };
      case 1: return { label: 'Weak', color: 'bg-amber-500', text: 'text-amber-400' };
      case 2: return { label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-400' };
      case 3: return { label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' };
      case 4: return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
      default: return { label: '', color: 'bg-slate-700', text: 'text-slate-400' };
    }
  };

  // Debounced email existence check (500ms)
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setEmailAlreadyExists(false);
      return;
    }

    const timer = setTimeout(async () => {
      setEmailChecking(true);
      try {
        const { data, error } = await supabase.rpc('email_exists', { check_email: email.trim() });
        if (!error && typeof data === 'boolean') {
          setEmailAlreadyExists(data);
        }
      } catch (err) {
        console.error('Failed to check email existence:', err);
      } finally {
        setEmailChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, supabase]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailAlreadyExists) {
      toast.error('Email is already registered. Please log in instead.');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Please fulfill all password requirements.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://puffiflow-core-web-t8e1.vercel.app';
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Verification code sent to your email!');
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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

  const strengthInfo = getStrengthLabel(score);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Join PuffiFlow 4K</h1>
          <p className="text-slate-400 text-xs md:text-sm">Start upscaling videos to 4K on Modal GPU clusters</p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-sm transition-all flex items-center justify-center space-x-3 shadow-md"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.3-1.4-.3-2.2z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
          )}
          <span>Sign up with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase font-semibold relative">Or Email</span>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
              {emailChecking && <Loader2 className="w-4 h-4 text-slate-500 animate-spin absolute right-3.5 top-3.5" />}
            </div>

            {/* Inline Email Exists Check */}
            {emailAlreadyExists && (
              <p className="text-xs text-amber-400 mt-1.5 flex items-center justify-between">
                <span>Email already registered.</span>
                <Link href="/login" className="underline font-semibold hover:text-white">Log in instead?</Link>
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-300 absolute right-3.5 top-3.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength Meter */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Strength:</span>
                  <span className={`font-semibold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex gap-1">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`h-full flex-1 transition-all ${
                        score >= idx + 1 ? strengthInfo.color : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Password Criteria Checklist */}
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px] text-slate-400">
              <div className={`flex items-center space-x-1 ${hasMinLength ? 'text-emerald-400' : ''}`}>
                {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-600" />}
                <span>8+ characters</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasUppercase ? 'text-emerald-400' : ''}`}>
                {hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-600" />}
                <span>1 uppercase (A-Z)</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasLowercase ? 'text-emerald-400' : ''}`}>
                {hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-600" />}
                <span>1 lowercase (a-z)</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasNumber ? 'text-emerald-400' : ''}`}>
                {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-600" />}
                <span>1 number (0-9)</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasSymbol ? 'text-emerald-400' : ''} col-span-2`}>
                {hasSymbol ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-600" />}
                <span>1 special character (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-500 hover:text-slate-300 absolute right-3.5 top-3.5"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || emailAlreadyExists || !isPasswordValid}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign Up & Send Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
