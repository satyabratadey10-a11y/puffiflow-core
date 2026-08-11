'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { KeyRound, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance focus to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) {
      toast.error('Please enter a valid 6-digit code.');
      return;
    }

    if (!email) {
      toast.error('Email address is required.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: 'signup',
      });

      if (error) {
        toast.error(error.message || 'Invalid or expired verification code.');
        return;
      }

      toast.success('Email verified successfully!');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending || !email) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('A new verification code has been sent to your email.');
        setResendCooldown(60);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-white relative">
      {/* Slow-floating ambient background gradient sphere */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-emerald-200/30 via-teal-200/20 to-cyan-200/30 rounded-full blur-[120px] pointer-events-none animate-blob" />

      <div className="w-full max-w-md p-8 rounded-2xl liquid-glass-card shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verify Email</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Enter 6-Digit Code</h1>
          <p className="text-slate-600 text-xs md:text-sm">
            We sent a verification code to <span className="text-slate-900 font-bold">{email || 'your email'}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* 6-Box OTP Input */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                autoComplete="one-time-code"
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-mono font-bold rounded-2xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Verify & Launch Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || resending}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Resend code'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
        <span className="font-semibold text-sm">Loading verification form...</span>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
