'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { initialEventSchema, type InitialEventFormData } from '@/lib/validators/onboarding';
import { createInitialEvent } from '@/actions/onboarding';

export default function StepEvent() {
  const { initialEvent, updateInitialEvent, organizerId, setStep, completeStep, setSaving, setLastSaved } = useOnboardingStore();
  const [bannerPreview, setBannerPreview] = useState(initialEvent.bannerUrl);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InitialEventFormData>({
    resolver: zodResolver(initialEventSchema),
    defaultValues: initialEvent,
  });

  const onSubmit = async (data: InitialEventFormData) => {
    updateInitialEvent(data);
    if (organizerId) {
      setSaving(true);
      try {
        await createInitialEvent(organizerId, data);
        setLastSaved(new Date().toISOString());
      } finally {
        setSaving(false);
      }
    }
    completeStep(4);
    setStep(5);
  };

  const handleSkip = () => {
    completeStep(4);
    setStep(5);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Your First Event</h2>
      <p className="text-sm text-slate-500 mb-8">Set up an event to get started (optional)</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field label="Event Name *" error={errors.eventName?.message}>
          <input {...register('eventName')} className={inputClass(!!errors.eventName)} placeholder="Harare Tech Meetup 2026" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Category *" error={errors.category?.message}>
            <select {...register('category')} className={inputClass(!!errors.category)}>
              <option value="">Select...</option>
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="concert">Concert</option>
              <option value="sports">Sports</option>
              <option value="festival">Festival</option>
              <option value="networking">Networking</option>
              <option value="charity">Charity</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Venue *" error={errors.venue?.message}>
            <input {...register('venue')} className={inputClass(!!errors.venue)} placeholder="Harare International Conference Centre" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Date *" error={errors.eventDate?.message}>
            <input {...register('eventDate')} type="date" className={inputClass(!!errors.eventDate)} />
          </Field>
          <Field label="Start Time *" error={errors.startTime?.message}>
            <input {...register('startTime')} type="time" className={inputClass(!!errors.startTime)} />
          </Field>
          <Field label="End Time *" error={errors.endTime?.message}>
            <input {...register('endTime')} type="time" className={inputClass(!!errors.endTime)} />
          </Field>
        </div>

        <Field label="Capacity *" error={errors.capacity?.message}>
          <input {...register('capacity')} type="number" min="1" className={inputClass(!!errors.capacity)} placeholder="500" />
        </Field>

        <Field label="Description *" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={4}
            className={inputClass(!!errors.description) + ' resize-none'}
            placeholder="Describe your event..."
          />
        </Field>

        <Field label="Event Banner">
          <label className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors overflow-hidden">
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover rounded-xl" />
            ) : (
              <div className="text-center">
                <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-400">Upload banner image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setBannerPreview(url);
                  setValue('bannerUrl', url);
                }
              }}
            />
          </label>
        </Field>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(3)}
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
