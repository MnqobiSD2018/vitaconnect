export const APP_NAME = 'VitaConnect';
export const APP_DESCRIPTION = "Zimbabwe's Premier Event Management & Ticketing Platform";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const ROLES = {
  ATTENDEE: 'attendee',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
} as const;

export const EVENT_STATUSES = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_PROVIDERS = {
  PAYNOW: 'paynow',
  STRIPE: 'stripe',
  FREE: 'free',
} as const;

export const CURRENCY = 'USD';

export const MAX_TICKETS_PER_ORDER = 5;

export const SEAT_HOLD_DURATION_MINUTES = 15;

export const SUPPORTED_PAYMENT_METHODS = [
  { id: 'ecocash', label: 'EcoCash', icon: 'Smartphone' },
  { id: 'onemoney', label: 'OneMoney', icon: 'Smartphone' },
  { id: 'card', label: 'Visa / Mastercard', icon: 'CreditCard' },
] as const;
