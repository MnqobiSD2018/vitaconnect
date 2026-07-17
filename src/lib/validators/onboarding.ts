import { z } from 'zod';

export const businessInfoSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  tradingName: z.string().optional(),
  businessEmail: z.string().email('Please enter a valid email'),
  phone: z.string().min(8, 'Phone number is required'),
  businessType: z.string().min(1, 'Business type is required'),
  organizerCategory: z.string().min(1, 'Category is required'),
  yearsInBusiness: z.string().min(1, 'This field is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  physicalAddress: z.string().min(1, 'Address is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  companyDescription: z.string().min(10, 'Please provide a brief description'),
  logoUrl: z.string().optional(),
});

export const accountDetailsSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const bankingDetailsSchema = z.object({
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  branch: z.string().optional(),
  mobileMoney: z.string().optional(),
  ecocash: z.string().optional(),
  paynowMerchantId: z.string().optional(),
  stripeAccount: z.string().optional(),
  paypalEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
});

export const orgPreferencesSchema = z.object({
  defaultCurrency: z.string().min(1, 'Currency is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  ticketCurrency: z.string().min(1, 'Ticket currency is required'),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  ticketPrefix: z
    .string()
    .min(1, 'Prefix is required')
    .max(5, 'Max 5 characters')
    .regex(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers'),
  defaultTaxRate: z.string(),
  brandColor: z.string(),
  theme: z.enum(['light', 'dark'] as const),
});

export const initialEventSchema = z.object({
  eventName: z.string().min(2, 'Event name is required'),
  category: z.string().min(1, 'Category is required'),
  venue: z.string().min(1, 'Venue is required'),
  eventDate: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  bannerUrl: z.string().optional(),
  description: z.string().min(10, 'Description is required'),
});

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;
export type AccountDetailsFormData = z.infer<typeof accountDetailsSchema>;
export type BankingDetailsFormData = z.infer<typeof bankingDetailsSchema>;
export type OrgPreferencesFormData = z.infer<typeof orgPreferencesSchema>;
export type InitialEventFormData = z.infer<typeof initialEventSchema>;
