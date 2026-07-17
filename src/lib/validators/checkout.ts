import { z } from 'zod';

export const attendeeSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(6, 'Phone number is required'),
});

export const checkoutSchema = z.object({
  attendees: z.array(attendeeSchema).min(1, 'At least one attendee is required'),
  paymentMethod: z.enum(['paynow', 'stripe'] as const, {
    message: 'Please select a payment method',
  }),
});

export type AttendeeFormData = z.infer<typeof attendeeSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
