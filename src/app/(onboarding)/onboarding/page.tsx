'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Building2, User, CreditCard, Settings, Calendar, ClipboardCheck } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useAuth } from '@/hooks/use-auth';
import StepBusiness from './steps/step-business';
import StepAccount from './steps/step-account';
import StepBanking from './steps/step-banking';
import StepPreferences from './steps/step-preferences';
import StepEvent from './steps/step-event';
import StepReview from './steps/step-review';

const STEPS = [
  { label: 'Business', icon: Building2, optional: false },
  { label: 'Account', icon: User, optional: false },
  { label: 'Banking', icon: CreditCard, optional: true },
  { label: 'Preferences', icon: Settings, optional: false },
  { label: 'First Event', icon: Calendar, optional: true },
  { label: 'Review', icon: ClipboardCheck, optional: false },
];

const stepComponents = [StepBusiness, StepAccount, StepBanking, StepPreferences, StepEvent, StepReview];

export default function OnboardingWizard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    currentStep,
    completedSteps,
    setStep,
    isSaving,
    lastSaved,
    accountDetails,
    updateAccountDetails,
  } = useOnboardingStore();

  useEffect(() => {
    if (!authLoading && user && !accountDetails.email) {
      updateAccountDetails({
        email: user.email || '',
        fullName: user.user_metadata?.full_name || '',
      });
    }
  }, [user, authLoading, accountDetails.email, updateAccountDetails]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  const StepComponent = stepComponents[currentStep];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Organizer Onboarding</h1>
              <p className="text-xs text-slate-500">Set up your organization in a few steps</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {isSaving && (
                <span className="flex items-center gap-1.5 text-amber-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Saving...
                </span>
              )}
              {lastSaved && !isSaving && (
                <span className="text-emerald-600">Saved {new Date(lastSaved).toLocaleTimeString()}</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-1">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isCurrent = index === currentStep;
              const Icon = step.icon;

              return (
                <React.Fragment key={step.label}>
                  <button
                    onClick={() => {
                      if (isCompleted || index <= Math.max(...completedSteps, currentStep)) {
                        setStep(index);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-slate-900 text-white shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'text-slate-400 cursor-default'
                    }`}
                    disabled={!isCompleted && index > currentStep}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                    {step.optional && !isCompleted && (
                      <span className="text-[9px] opacity-60 hidden sm:inline">opt</span>
                    )}
                  </button>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      {/* Step Content */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
