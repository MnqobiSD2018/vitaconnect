'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { bankingDetailsSchema, type BankingDetailsFormData } from '@/lib/validators/onboarding';
import { saveBankingDetails } from '@/actions/onboarding';

export default function StepBanking() {
  const { bankingDetails, updateBankingDetails, organizerId, setStep, completeStep, setSaving, setLastSaved } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BankingDetailsFormData>({
    resolver: zodResolver(bankingDetailsSchema),
    defaultValues: bankingDetails,
  });

  const onSubmit = async (data: BankingDetailsFormData) => {
    updateBankingDetails(data);
    if (organizerId) {
      setSaving(true);
      try {
        await saveBankingDetails(organizerId, data);
        setLastSaved(new Date().toISOString());
      } finally {
        setSaving(false);
      }
    }
    completeStep(2);
    setStep(3);
  };

  const handleSkip = () => {
    completeStep(2);
    setStep(3);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Banking Details</h2>
      <p className="text-sm text-slate-500 mb-8">Set up payment accounts to receive payouts (optional)</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Bank Account</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bank Name" error={errors.bankName?.message}>
              <select {...register('bankName')} className={inputClass(false)}>
                <option value="">Select bank...</option>
                <option value="cbz">CBZ</option>
                <option value="stanbic">Stanbic</option>
                <option value="standard">Standard Chartered</option>
                <option value="nmb">NMB</option>
                <option value="ecobank">Ecobank</option>
                <option value="fbc">FBC</option>
                <option value="cabs">CABS</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Account Name">
              <input {...register('accountName')} className={inputClass(false)} placeholder="Account holder name" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Account Number">
              <input {...register('accountNumber')} className={inputClass(false)} placeholder="1234567890" />
            </Field>
            <Field label="Branch">
              <input {...register('branch')} className={inputClass(false)} placeholder="Branch name" />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Mobile Money & Online</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="EcoCash Number">
              <input {...register('ecocash')} className={inputClass(false)} placeholder="+263 77 XXX XXXX" />
            </Field>
            <Field label="Paynow Merchant ID">
              <input {...register('paynowMerchantId')} className={inputClass(false)} placeholder="Paynow integration key" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Stripe Account">
              <input {...register('stripeAccount')} className={inputClass(false)} placeholder="Stripe account ID" />
            </Field>
            <Field label="PayPal Email">
              <input {...register('paypalEmail')} type="email" className={inputClass(false)} placeholder="paypal@email.com" />
              {errors.paypalEmail?.message && <p className="mt-1 text-xs text-red-600">{errors.paypalEmail.message}</p>}
            </Field>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save & Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>
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
