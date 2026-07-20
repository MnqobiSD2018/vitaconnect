'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, ArrowRight, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { businessInfoSchema, type BusinessInfoFormData } from '@/lib/validators/onboarding';
import { saveBusinessInfo } from '@/actions/onboarding';

export default function StepBusiness() {
  const { businessInfo, updateBusinessInfo, setOrganizerId, organizerId, setStep, completeStep, setSaving, setLastSaved } = useOnboardingStore();
  const [logoPreview, setLogoPreview] = useState(businessInfo.logoUrl);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: businessInfo,
  });

  const watchedLogo = watch('logoUrl');

  const onSubmit = async (data: BusinessInfoFormData) => {
    updateBusinessInfo(data);
    setSaving(true);
    setServerError(null);
    try {
      const result = await saveBusinessInfo({ ...data, organizerId });
      if (result.error) {
        setServerError(result.error);
        return;
      }
      if (result.id) setOrganizerId(result.id);
      setLastSaved(new Date().toISOString());
      completeStep(0);
      setStep(1);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Business Information</h2>
      <p className="text-sm text-slate-500 mb-8">Tell us about your organization</p>

      {serverError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business Name *" error={errors.businessName?.message}>
            <input {...register('businessName')} className={inputClass(!!errors.businessName)} placeholder="Acme Events Ltd" />
          </Field>
          <Field label="Trading Name" error={errors.tradingName?.message}>
            <input {...register('tradingName')} className={inputClass(false)} placeholder="Acme Events" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business Email *" error={errors.businessEmail?.message}>
            <input {...register('businessEmail')} type="email" className={inputClass(!!errors.businessEmail)} placeholder="info@acme.co.zw" />
          </Field>
          <Field label="Phone Number *" error={errors.phone?.message}>
            <input {...register('phone')} className={inputClass(!!errors.phone)} placeholder="+263 77 123 4567" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Business Type *" error={errors.businessType?.message}>
            <select {...register('businessType')} className={inputClass(!!errors.businessType)}>
              <option value="">Select...</option>
              <option value="sole_proprietor">Sole Proprietor</option>
              <option value="partnership">Partnership</option>
              <option value="private_limit">Private Limited</option>
              <option value="public_limit">Public Limited</option>
              <option value="non_profit">Non-Profit / NGO</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Organizer Category *" error={errors.organizerCategory?.message}>
            <select {...register('organizerCategory')} className={inputClass(!!errors.organizerCategory)}>
              <option value="">Select...</option>
              <option value="sports">Sports & Fitness</option>
              <option value="music">Music & Entertainment</option>
              <option value="business">Business & Tech</option>
              <option value="cultural">Cultural & Arts</option>
              <option value="charity">Charity & Community</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Years in Business *" error={errors.yearsInBusiness?.message}>
            <select {...register('yearsInBusiness')} className={inputClass(!!errors.yearsInBusiness)}>
              <option value="">Select...</option>
              <option value="0-1">Less than 1 year</option>
              <option value="1-3">1–3 years</option>
              <option value="3-5">3–5 years</option>
              <option value="5-10">5–10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Country *" error={errors.country?.message}>
            <input {...register('country')} className={inputClass(!!errors.country)} />
          </Field>
          <Field label="City *" error={errors.city?.message}>
            <input {...register('city')} className={inputClass(!!errors.city)} placeholder="Harare" />
          </Field>
          <Field label="Website">
            <input {...register('website')} className={inputClass(false)} placeholder="https://acme.co.zw" />
          </Field>
        </div>

        <Field label="Physical Address *" error={errors.physicalAddress?.message}>
          <input {...register('physicalAddress')} className={inputClass(!!errors.physicalAddress)} placeholder="123 Samora Machel Ave, Harare" />
        </Field>

        <Field label="Company Description *" error={errors.companyDescription?.message}>
          <textarea
            {...register('companyDescription')}
            rows={3}
            className={inputClass(!!errors.companyDescription) + ' resize-none'}
            placeholder="Brief description of your organization..."
          />
        </Field>

        <Field label="Company Logo" error={errors.logoUrl?.message}>
          <div className="flex items-center gap-4">
            <label className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <Upload className="h-5 w-5 text-slate-400" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setLogoPreview(url);
                    setValue('logoUrl', url);
                  }
                }}
              />
            </label>
            <span className="text-xs text-slate-400">Upload your logo (optional)</span>
          </div>
        </Field>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
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
