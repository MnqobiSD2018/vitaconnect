import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  starts_at: z.string().min(1, 'Start date is required'),
  ends_at: z.string().min(1, 'End date is required'),
  venue_address: z.string().min(1, 'Venue is required'),
  category_id: z.number().min(1, 'Category is required'),
  cover_image_url: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  max_attendees: z.number().positive().optional(),
  is_online: z.boolean().default(false),
  online_url: z.string().url().optional().or(z.literal('')),
});

export const createTicketTierSchema = z.object({
  name: z.string().min(1, 'Tier name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or more'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type CreateTicketTierFormData = z.infer<typeof createTicketTierSchema>;
