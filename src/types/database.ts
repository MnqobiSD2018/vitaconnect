export type UserRole = 'attendee' | 'organizer' | 'admin';

export type EventStatus = 'draft' | 'pending_approval' | 'published' | 'cancelled' | 'completed';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export type PaymentProvider = 'paynow' | 'stripe' | 'free';

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type NotificationType =
  | 'ticket_purchased'
  | 'event_reminder'
  | 'event_cancelled'
  | 'event_updated'
  | 'payout_processed'
  | 'review_received';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizerProfile {
  id: string;
  user_id: string;
  organization_name: string;
  bio: string | null;
  website: string | null;
  logo_url: string | null;
  cover_url: string | null;
  paynow_email: string | null;
  paynow_integration_key: string | null;
  bank_name: string | null;
  bank_account: string | null;
  is_approved: boolean;
  approval_note: string | null;
  total_revenue: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  capacity: number | null;
  created_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  category_id: number | null;
  venue_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  content: Record<string, unknown> | null;
  cover_image_url: string | null;
  gallery_urls: string[];
  starts_at: string;
  ends_at: string;
  doors_open_at: string | null;
  timezone: string;
  is_online: boolean;
  online_url: string | null;
  venue_address: string | null;
  status: EventStatus;
  is_featured: boolean;
  max_attendees: number | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  total_sold: number;
  total_revenue: number;
  approved_by: string | null;
  approved_at: string | null;
  rejection_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketTier {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  quantity: number;
  quantity_sold: number;
  max_per_order: number;
  min_per_order: number;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  event_id: string;
  status: OrderStatus;
  subtotal: number;
  service_fee: number;
  total: number;
  currency: string;
  payment_provider: PaymentProvider | null;
  payment_ref: string | null;
  payment_status: string | null;
  paid_at: string | null;
  attendee_name: string | null;
  attendee_email: string | null;
  attendee_phone: string | null;
  ip_address: string | null;
  user_agent: string | null;
  notes: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  order_id: string;
  tier_id: string;
  event_id: string;
  user_id: string;
  ticket_number: string;
  qr_code: string;
  qr_secret: string;
  holder_name: string | null;
  holder_email: string | null;
  price_paid: number;
  currency: string;
  is_checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  check_in_device: string | null;
  is_transferred: boolean;
  transferred_to: string | null;
  transferred_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}
