'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { KeyRound, Mail, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://puffiflow-core-web-t8e1.vercel.app';
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.info('If an account exists for this email, a reset code has been sent.');
        router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-white relative">
      {/* Slow-floating ambient background gradient sphere */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-emerald-200/30 via-teal-200/20 to-cyan-200/30 rounded-full blur-[120px] pointer-events-none animate-blob" />

      <div className="w-full max-w-md p-8 rounded-2xl liquid-glass-card shadow-2xl space-y-6 relative z-10">
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span>Password Recovery</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Reset Password</h1>
          <p className="text-slate-600 text-xs md:text-sm">Enter your email to receive a 6-digit recovery code</p>
        </div>

        <form onSubmit={handleResetRequest} className="space-y-4">
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
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send Reset Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
