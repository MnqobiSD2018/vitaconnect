import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BusinessInfo {
  businessName: string;
  tradingName: string;
  businessEmail: string;
  phone: string;
  businessType: string;
  organizerCategory: string;
  yearsInBusiness: string;
  country: string;
  city: string;
  physicalAddress: string;
  website: string;
  companyDescription: string;
  logoUrl: string;
}

export interface AccountDetails {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface BankingDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  mobileMoney: string;
  ecocash: string;
  paynowMerchantId: string;
  stripeAccount: string;
  paypalEmail: string;
}

export interface OrgPreferences {
  defaultCurrency: string;
  timezone: string;
  ticketCurrency: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  ticketPrefix: string;
  defaultTaxRate: string;
  brandColor: string;
  theme: 'light' | 'dark';
}

export interface InitialEvent {
  eventName: string;
  category: string;
  venue: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  capacity: string;
  bannerUrl: string;
  description: string;
}

export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  businessInfo: BusinessInfo;
  accountDetails: AccountDetails;
  bankingDetails: BankingDetails;
  orgPreferences: OrgPreferences;
  initialEvent: InitialEvent;
  organizerId: string | null;
  isSaving: boolean;
  lastSaved: string | null;

  setStep: (step: number) => void;
  completeStep: (step: number) => void;
  updateBusinessInfo: (data: Partial<BusinessInfo>) => void;
  updateAccountDetails: (data: Partial<AccountDetails>) => void;
  updateBankingDetails: (data: Partial<BankingDetails>) => void;
  updateOrgPreferences: (data: Partial<OrgPreferences>) => void;
  updateInitialEvent: (data: Partial<InitialEvent>) => void;
  setOrganizerId: (id: string) => void;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: string) => void;
  reset: () => void;
}

const initialBusinessInfo: BusinessInfo = {
  businessName: '',
  tradingName: '',
  businessEmail: '',
  phone: '',
  businessType: '',
  organizerCategory: '',
  yearsInBusiness: '',
  country: 'Zimbabwe',
  city: '',
  physicalAddress: '',
  website: '',
  companyDescription: '',
  logoUrl: '',
};

const initialAccountDetails: AccountDetails = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const initialBankingDetails: BankingDetails = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  branch: '',
  mobileMoney: '',
  ecocash: '',
  paynowMerchantId: '',
  stripeAccount: '',
  paypalEmail: '',
};

const initialOrgPreferences: OrgPreferences = {
  defaultCurrency: 'USD',
  timezone: 'Africa/Harare',
  ticketCurrency: 'USD',
  emailNotifications: true,
  smsNotifications: false,
  ticketPrefix: 'VC',
  defaultTaxRate: '0',
  brandColor: '#0d9488',
  theme: 'light',
};

const initialInitialEvent: InitialEvent = {
  eventName: '',
  category: '',
  venue: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  capacity: '',
  bannerUrl: '',
  description: '',
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      completedSteps: [],
      businessInfo: initialBusinessInfo,
      accountDetails: initialAccountDetails,
      bankingDetails: initialBankingDetails,
      orgPreferences: initialOrgPreferences,
      initialEvent: initialInitialEvent,
      organizerId: null,
      isSaving: false,
      lastSaved: null,

      setStep: (step) => set({ currentStep: step }),

      completeStep: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      updateBusinessInfo: (data) =>
        set((state) => ({
          businessInfo: { ...state.businessInfo, ...data },
        })),

      updateAccountDetails: (data) =>
        set((state) => ({
          accountDetails: { ...state.accountDetails, ...data },
        })),

      updateBankingDetails: (data) =>
        set((state) => ({
          bankingDetails: { ...state.bankingDetails, ...data },
        })),

      updateOrgPreferences: (data) =>
        set((state) => ({
          orgPreferences: { ...state.orgPreferences, ...data },
        })),

      updateInitialEvent: (data) =>
        set((state) => ({
          initialEvent: { ...state.initialEvent, ...data },
        })),

      setOrganizerId: (id) => set({ organizerId: id }),
      setSaving: (saving) => set({ isSaving: saving }),
      setLastSaved: (date) => set({ lastSaved: date }),
      reset: () =>
        set({
          currentStep: 0,
          completedSteps: [],
          businessInfo: initialBusinessInfo,
          accountDetails: initialAccountDetails,
          bankingDetails: initialBankingDetails,
          orgPreferences: initialOrgPreferences,
          initialEvent: initialInitialEvent,
          organizerId: null,
          isSaving: false,
          lastSaved: null,
        }),
    }),
    {
      name: 'vitaconnect-onboarding',
    }
  )
);
