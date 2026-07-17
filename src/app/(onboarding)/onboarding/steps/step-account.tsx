'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { accountDetailsSchema, type AccountDetailsFormData } from '@/lib/validators/onboarding';

export default function StepAccount() {
  const { accountDetails, updateAccountDetails, setStep, completeStep } = useOnboardingStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccountDetailsFormData>({
    resolver: zodResolver(accountDetailsSchema),
    defaultValues: accountDetails,
  });

  const password = watch('password', '');

  const strength = getPasswordStrength(password);

  const onSubmit = (data: AccountDetailsFormData) => {
    updateAccountDetails(data);
    completeStep(1);
    setStep(2);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Account Details</h2>
      <p className="text-sm text-slate-500 mb-8">Set up your owner account credentials</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field label="Full Name *" error={errors.fullName?.message}>
          <input {...register('fullName')} className={inputClass(!!errors.fullName)} placeholder="John Doe" />
        </Field>

        <Field label="Username *" error={errors.username?.message}>
          <input {...register('username')} className={inputClass(!!errors.username)} placeholder="johndoe" />
        </Field>

        <Field label="Email *" error={errors.email?.message}>
          <input {...register('email')} type="email" className={inputClass(!!errors.email)} />
        </Field>

        <Field label="Password *" error={errors.password?.message}>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={inputClass(!!errors.password) + ' pr-10'}
              placeholder="Min 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < strength.level
                        ? strength.level <= 1
                          ? 'bg-red-500'
                          : strength.level <= 2
                          ? 'bg-amber-500'
                          : strength.level <= 3
                          ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">{strength.label}</p>
            </div>
          )}
        </Field>

        <Field label="Confirm Password *" error={errors.confirmPassword?.message}>
          <input
            {...register('confirmPassword')}
            type="password"
            className={inputClass(!!errors.confirmPassword)}
            placeholder="Re-enter password"
          />
        </Field>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(0)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return { level: score, label: labels[score] || '' };
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
    hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-slate-400'
  }`;
}
