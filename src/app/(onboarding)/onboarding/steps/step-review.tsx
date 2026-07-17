'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, Pencil } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { completeOnboarding } from '@/actions/onboarding';

export default function StepReview() {
  const router = useRouter();
  const {
    businessInfo,
    accountDetails,
    bankingDetails,
    orgPreferences,
    initialEvent,
    organizerId,
    setStep,
    completeStep,
    setSaving,
    isSaving,
    reset,
  } = useOnboardingStore();

  const [finished, setFinished] = useState(false);

  const handleFinish = async () => {
    if (!organizerId) return;
    setSaving(true);
    try {
      const result = await completeOnboarding(organizerId);
      if (!result.error) {
        completeStep(5);
        setFinished(true);
        setTimeout(() => {
          reset();
          router.push('/organizer');
        }, 1500);
      }
    } finally {
      setSaving(false);
    }
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">You're All Set!</h2>
        <p className="text-slate-500 text-sm">Redirecting you to your organizer dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Review & Finish</h2>
      <p className="text-sm text-slate-500 mb-8">Review your information before submitting</p>

      <div className="space-y-4">
        <ReviewSection
          title="Business Information"
          onEdit={() => setStep(0)}
          items={[
            { label: 'Business Name', value: businessInfo.businessName },
            { label: 'Email', value: businessInfo.businessEmail },
            { label: 'Phone', value: businessInfo.phone },
            { label: 'Type', value: businessInfo.businessType },
            { label: 'Category', value: businessInfo.organizerCategory },
            { label: 'City', value: businessInfo.city },
            { label: 'Country', value: businessInfo.country },
          ]}
        />

        <ReviewSection
          title="Account Details"
          onEdit={() => setStep(1)}
          items={[
            { label: 'Full Name', value: accountDetails.fullName },
            { label: 'Username', value: accountDetails.username },
            { label: 'Email', value: accountDetails.email },
          ]}
        />

        <ReviewSection
          title="Banking Details"
          onEdit={() => setStep(2)}
          items={[
            { label: 'Bank', value: bankingDetails.bankName || 'Not provided' },
            { label: 'Account', value: bankingDetails.accountNumber || 'Not provided' },
            { label: 'EcoCash', value: bankingDetails.ecocash || 'Not provided' },
            { label: 'Paynow', value: bankingDetails.paynowMerchantId || 'Not provided' },
          ]}
        />

        <ReviewSection
          title="Preferences"
          onEdit={() => setStep(3)}
          items={[
            { label: 'Currency', value: orgPreferences.defaultCurrency },
            { label: 'Timezone', value: orgPreferences.timezone },
            { label: 'Ticket Prefix', value: orgPreferences.ticketPrefix },
            { label: 'Email Notifications', value: orgPreferences.emailNotifications ? 'On' : 'Off' },
            { label: 'Theme', value: orgPreferences.theme },
          ]}
        />

        {initialEvent.eventName && (
          <ReviewSection
            title="First Event"
            onEdit={() => setStep(4)}
            items={[
              { label: 'Event', value: initialEvent.eventName },
              { label: 'Category', value: initialEvent.category },
              { label: 'Venue', value: initialEvent.venue },
              { label: 'Date', value: initialEvent.eventDate },
              { label: 'Capacity', value: initialEvent.capacity },
            ]}
          />
        )}
      </div>

      <div className="flex justify-between pt-8">
        <button
          type="button"
          onClick={() => setStep(4)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleFinish}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {isSaving ? 'Activating...' : 'Finish & Activate'}
        </button>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  items,
}: {
  title: string;
  onEdit: () => void;
  items: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {items.map((item) => (
          <div key={item.label}>
            <span className="text-xs text-slate-400">{item.label}</span>
            <p className="text-sm text-slate-900 font-medium">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
