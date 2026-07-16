import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  inet,
  primaryKey,
  unique,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['attendee', 'organizer', 'admin']);
export const eventStatusEnum = pgEnum('event_status', ['draft', 'pending_approval', 'published', 'cancelled', 'completed']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']);
export const paymentProviderEnum = pgEnum('payment_provider', ['paynow', 'stripe', 'free']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'processing', 'completed', 'failed']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'ticket_purchased', 'event_reminder', 'event_cancelled',
  'event_updated', 'payout_processed', 'review_received',
]);

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  username: text('username').unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  role: userRoleEnum('role').notNull().default('attendee'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const organizerProfiles = pgTable('organizer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').unique().notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  organizationName: text('organization_name').notNull(),
  bio: text('bio'),
  website: text('website'),
  logoUrl: text('logo_url'),
  coverUrl: text('cover_url'),
  paynowEmail: text('paynow_email'),
  paynowIntegrationKey: text('paynow_integration_key'),
  bankName: text('bank_name'),
  bankAccount: text('bank_account'),
  isApproved: boolean('is_approved').default(false),
  approvalNote: text('approval_note'),
  totalRevenue: numeric('total_revenue', { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const categories = pgTable('categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
});

export const venues = pgTable('venues', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull().default('Harare'),
  country: text('country').notNull().default('Zimbabwe'),
  lat: numeric('lat', { precision: 10, scale: 7 }),
  lng: numeric('lng', { precision: 10, scale: 7 }),
  capacity: integer('capacity'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizerId: uuid('organizer_id').notNull().references(() => organizerProfiles.id),
  categoryId: integer('category_id').references(() => categories.id),
  venueId: uuid('venue_id').references(() => venues.id),

  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  content: jsonb('content'),
  coverImageUrl: text('cover_image_url'),
  galleryUrls: text('gallery_urls').array().default([]),

  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  doorsOpenAt: timestamp('doors_open_at', { withTimezone: true }),
  timezone: text('timezone').notNull().default('Africa/Harare'),

  isOnline: boolean('is_online').default(false),
  onlineUrl: text('online_url'),
  venueAddress: text('venue_address'),

  status: eventStatusEnum('status').default('draft'),
  isFeatured: boolean('is_featured').default(false),
  maxAttendees: integer('max_attendees'),
  tags: text('tags').array().default([]),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),

  totalSold: integer('total_sold').default(0),
  totalRevenue: numeric('total_revenue', { precision: 12, scale: 2 }).default('0'),

  approvedBy: uuid('approved_by').references(() => profiles.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectionNote: text('rejection_note'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_events_status').on(table.status),
  index('idx_events_starts_at').on(table.startsAt),
  index('idx_events_organizer').on(table.organizerId),
  index('idx_events_slug').on(table.slug),
]);

export const ticketTiers = pgTable('ticket_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  quantity: integer('quantity').notNull(),
  quantitySold: integer('quantity_sold').default(0),
  maxPerOrder: integer('max_per_order').default(10),
  minPerOrder: integer('min_per_order').default(1),
  saleStartsAt: timestamp('sale_starts_at', { withTimezone: true }),
  saleEndsAt: timestamp('sale_ends_at', { withTimezone: true }),
  isVisible: boolean('is_visible').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_tiers_event').on(table.eventId),
]);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').unique().notNull(),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  eventId: uuid('event_id').notNull().references(() => events.id),

  status: orderStatusEnum('status').default('pending'),

  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  serviceFee: numeric('service_fee', { precision: 10, scale: 2 }).default('0'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),

  paymentProvider: paymentProviderEnum('payment_provider'),
  paymentRef: text('payment_ref'),
  paymentStatus: text('payment_status'),
  paidAt: timestamp('paid_at', { withTimezone: true }),

  attendeeName: text('attendee_name'),
  attendeeEmail: text('attendee_email'),
  attendeePhone: text('attendee_phone'),

  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  notes: text('notes'),

  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_orders_user').on(table.userId),
  index('idx_orders_event').on(table.eventId),
  index('idx_orders_status').on(table.status),
  index('idx_orders_number').on(table.orderNumber),
]);

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  tierId: uuid('tier_id').notNull().references(() => ticketTiers.id),
  eventId: uuid('event_id').notNull().references(() => events.id),
  userId: uuid('user_id').notNull().references(() => profiles.id),

  ticketNumber: text('ticket_number').unique().notNull(),
  qrCode: text('qr_code').unique().notNull(),
  qrSecret: text('qr_secret').notNull(),

  holderName: text('holder_name'),
  holderEmail: text('holder_email'),

  pricePaid: numeric('price_paid', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),

  isCheckedIn: boolean('is_checked_in').default(false),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  checkedInBy: uuid('checked_in_by').references(() => profiles.id),
  checkInDevice: text('check_in_device'),

  isTransferred: boolean('is_transferred').default(false),
  transferredTo: uuid('transferred_to').references(() => profiles.id),
  transferredAt: timestamp('transferred_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_tickets_order').on(table.orderId),
  index('idx_tickets_event').on(table.eventId),
  index('idx_tickets_user').on(table.userId),
  index('idx_tickets_qr').on(table.qrCode),
  index('idx_tickets_number').on(table.ticketNumber),
]);

export const seatHolds = pgTable('seat_holds', {
  id: uuid('id').primaryKey().defaultRandom(),
  tierId: uuid('tier_id').notNull().references(() => ticketTiers.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(),
  quantity: integer('quantity').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_holds_tier').on(table.tierId),
  index('idx_holds_expires').on(table.expiresAt),
]);

export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizerId: uuid('organizer_id').notNull().references(() => organizerProfiles.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  status: payoutStatusEnum('status').default('pending'),
  reference: text('reference'),
  notes: text('notes'),
  processedBy: uuid('processed_by').references(() => profiles.id),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const eventSaves = pgTable('event_saves', {
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.eventId] }),
]);

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  unique('reviews_event_user_unique').on(table.eventId, table.userId),
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  data: jsonb('data').default({}),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_notifs_user').on(table.userId, table.isRead),
]);

export const platformSettings = pgTable('platform_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Placeholder table for auth.users reference (Supabase manages this table)
const authUsers = pgTable('auth.users', {
  id: uuid('id').primaryKey(),
});
