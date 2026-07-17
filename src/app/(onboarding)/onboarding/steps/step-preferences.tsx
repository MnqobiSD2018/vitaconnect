'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { orgPreferencesSchema, type OrgPreferencesFormData } from '@/lib/validators/onboarding';

export default function StepPreferences() {
  const { orgPreferences, updateOrgPreferences, setStep, completeStep } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrgPreferencesFormData>({
    resolver: zodResolver(orgPreferencesSchema),
    defaultValues: orgPreferences,
  });

  const theme = watch('theme');
  const emailNotifications = watch('emailNotifications');
  const smsNotifications = watch('smsNotifications');

  const onSubmit = (data: OrgPreferencesFormData) => {
    updateOrgPreferences(data);
    completeStep(3);
    setStep(4);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Organization Preferences</h2>
      <p className="text-sm text-slate-500 mb-8">Customize your workspace settings</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">General</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Default Currency *" error={errors.defaultCurrency?.message}>
              <select {...register('defaultCurrency')} className={inputClass(false)}>
                <option value="USD">USD – US Dollar</option>
                <option value="ZWL">ZWL – Zimbabwe Dollar</option>
                <option value="ZAR">ZAR – South African Rand</option>
                <option value="GBP">GBP – British Pound</option>
                <option value="EUR">EUR – Euro</option>
              </select>
            </Field>
            <Field label="Timezone *" error={errors.timezone?.message}>
              <select {...register('timezone')} className={inputClass(false)}>
                <option value="Africa/Harare">Africa/Harare (CAT)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ticket Currency *" error={errors.ticketCurrency?.message}>
              <select {...register('ticketCurrency')} className={inputClass(false)}>
                <option value="USD">USD – US Dollar</option>
                <option value="ZWL">ZWL – Zimbabwe Dollar</option>
                <option value="ZAR">ZAR – South African Rand</option>
              </select>
            </Field>
            <Field label="Default Tax Rate (%)">
              <input {...register('defaultTaxRate')} type="number" min="0" max="100" className={inputClass(false)} placeholder="0" />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Tickets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ticket Number Prefix *" error={errors.ticketPrefix?.message}>
              <input {...register('ticketPrefix')} className={inputClass(false)} placeholder="VC" maxLength={5} />
              <p className="text-xs text-slate-400 mt-1">E.g. VC-00001</p>
            </Field>
            <Field label="Brand Color">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  {...register('brandColor')}
                  className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer"
                />
                <input {...register('brandColor')} className={inputClass(false)} placeholder="#0d9488" />
              </div>
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          <div className="space-y-3">
            <ToggleRow
              label="Email Notifications"
              description="Receive booking confirmations and updates via email"
              checked={emailNotifications}
              onChange={(v) => setValue('emailNotifications', v)}
            />
            <ToggleRow
              label="SMS Notifications"
              description="Get text message alerts for important events"
              checked={smsNotifications}
              onChange={(v) => setValue('smsNotifications', v)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Appearance</h3>
          <div className="flex gap-3">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue('theme', t)}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  theme === t
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t === 'light' ? '☀️ Light' : '🌙 Dark'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
          checked ? 'bg-slate-900' : 'bg-slate-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
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
