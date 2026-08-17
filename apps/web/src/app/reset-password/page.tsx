'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import zxcvbn from 'zxcvbn';
import { Lock, Eye, EyeOff, Check, X, ShieldCheck, Loader2 } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  // Live password criteria validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol;

  const strengthResult = newPassword ? zxcvbn(newPassword) : null;
  const score = strengthResult ? strengthResult.score : 0;

  const getStrengthLabel = (s: number) => {
    switch (s) {
      case 0: return { label: 'Very Weak', color: 'bg-red-500', text: 'text-red-600' };
      case 1: return { label: 'Weak', color: 'bg-amber-500', text: 'text-amber-600' };
      case 2: return { label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-600' };
      case 3: return { label: 'Good', color: 'bg-[#5ab5bb]', text: 'text-[#5ab5bb]' };
      case 4: return { label: 'Strong', color: 'bg-[#71C9CE]', text: 'text-[#1e484c]' };
      default: return { label: '', color: 'bg-slate-200', text: 'text-slate-500' };
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

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
      setOtp(pastedData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');

    if (token.length !== 6) {
      toast.error('Please enter the 6-digit recovery code.');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Please fulfill all password criteria.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify recovery OTP
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: 'recovery',
      });

      if (otpError) {
        toast.error(otpError.message || 'Invalid or expired recovery code.');
        return;
      }

      // 2. Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message || 'Failed to update password.');
        return;
      }

      toast.success('Password updated successfully! Please log in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const strengthInfo = getStrengthLabel(score);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-white relative">
      {/* Slow-floating ambient background gradient sphere */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-[#E3FDFD] via-[#CBF1F5] to-[#A6E3E9] rounded-full blur-[120px] pointer-events-none animate-blob" />

      <div className="w-full max-w-md p-8 rounded-2xl liquid-glass-card shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#71C9CE]" />
            <span>Set New Password</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Reset Password</h1>
          <p className="text-slate-600 text-xs md:text-sm">
            Enter the 6-digit recovery code sent to <span className="text-slate-900 font-bold">{email || 'your email'}</span>
          </p>
        </div>

        <form onSubmit={handleResetSubmit} className="space-y-4">
          {/* Email (If not passed in URL) */}
          {!emailParam && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 shadow-sm transition-colors"
              />
            </div>
          )}

          {/* 6-Box OTP Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">6-Digit Recovery Code</label>
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
                  className="w-12 h-12 text-center text-lg font-mono font-bold rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 shadow-sm transition-colors"
                />
              ))}
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            {/* Strength Meter */}
            {newPassword && (
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
              <div className={`flex items-center space-x-1 ${hasMinLength ? 'text-[#1e484c] font-bold' : ''}`}>
                {hasMinLength ? <Check className="w-3 h-3 text-[#71C9CE]" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>8+ characters</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasUppercase ? 'text-[#1e484c] font-bold' : ''}`}>
                {hasUppercase ? <Check className="w-3 h-3 text-[#71C9CE]" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>1 uppercase (A-Z)</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasLowercase ? 'text-[#1e484c] font-bold' : ''}`}>
                {hasLowercase ? <Check className="w-3 h-3 text-[#71C9CE]" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>1 lowercase (a-z)</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasNumber ? 'text-[#1e484c] font-bold' : ''}`}>
                {hasNumber ? <Check className="w-3 h-3 text-[#71C9CE]" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>1 number (0-9)</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasSymbol ? 'text-[#1e484c] font-bold' : ''} col-span-2`}>
                {hasSymbol ? <Check className="w-3 h-3 text-[#71C9CE]" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>1 special character (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#A6E3E9] text-slate-900 text-sm focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/20 shadow-sm transition-colors"
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
            disabled={loading || otp.join('').length !== 6 || !isPasswordValid}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-[#71C9CE] hover:bg-[#5ab5bb] shadow-lg shadow-[#71C9CE]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password & Log In</span>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-[#71C9CE] mr-2" />
        <span className="font-semibold text-sm">Loading reset password form...</span>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
