'use client';

import React, { useState, useEffect } from 'react';
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
      case 0: return { label: 'Very Weak', color: 'bg-red-500', text: 'text-red-600' };
      case 1: return { label: 'Weak', color: 'bg-amber-500', text: 'text-amber-600' };
      case 2: return { label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-600' };
      case 3: return { label: 'Good', color: 'bg-teal-500', text: 'text-teal-600' };
      case 4: return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
      default: return { label: '', color: 'bg-slate-200', text: 'text-slate-500' };
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
      const { error } = await supabase.auth.signUp({
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
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-white relative">
      {/* Slow-floating ambient background gradient sphere */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-emerald-200/30 via-teal-200/20 to-cyan-200/30 rounded-full blur-[120px] pointer-events-none animate-blob" />

      <div className="w-full max-w-md p-8 rounded-2xl liquid-glass-card shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Create Account</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Join PuffiFlow 4K</h1>
          <p className="text-slate-600 text-xs md:text-sm">Start upscaling videos to 4K on Modal GPU clusters</p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm transition-all flex items-center justify-center space-x-3 shadow-sm"
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
          <span>Sign up with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs text-slate-500 uppercase font-bold relative">Or Email</span>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-sm transition-colors"
              />
              {emailChecking && <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3.5 top-3.5" />}
            </div>

            {/* Inline Email Exists Check */}
            {emailAlreadyExists && (
              <p className="text-xs text-amber-700 font-medium mt-1.5 flex items-center justify-between">
                <span>Email already registered.</span>
                <Link href="/login" className="underline font-bold hover:text-emerald-700">Log in instead?</Link>
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-3.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength Meter */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Strength:</span>
                  <span className={`font-bold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`h-full flex-1 transition-all ${
                        score >= idx + 1 ? strengthInfo.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Password Criteria Checklist */}
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px] text-slate-500">
              <div className={`flex items-center space-x-1 ${hasMinLength ? 'text-emerald-700 font-bold' : ''}`}>
                {hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>8+ characters</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasUppercase ? 'text-emerald-700 font-bold' : ''}`}>
                {hasUppercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>1 uppercase (A-Z)</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasLowercase ? 'text-emerald-700 font-bold' : ''}`}>
                {hasLowercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>1 lowercase (a-z)</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasNumber ? 'text-emerald-700 font-bold' : ''}`}>
                {hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>1 number (0-9)</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasSymbol ? 'text-emerald-700 font-bold' : ''} col-span-2`}>
                {hasSymbol ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>1 special character (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-3.5"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || emailAlreadyExists || !isPasswordValid}
            className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
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

        <p className="text-center text-xs font-medium text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
