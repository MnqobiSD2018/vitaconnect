-- ============================================================
-- MIGRATION: 0001_initial_schema.sql
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- full-text search
CREATE EXTENSION IF NOT EXISTS "pg_cron";        -- scheduled jobs

-- ──────────────────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ──────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('attendee', 'organizer', 'admin');

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'attendee',
  is_verified   BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────
-- ORGANIZER PROFILES
-- ──────────────────────────────────────────────────────────
CREATE TABLE organizer_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  bio             TEXT,
  website         TEXT,
  logo_url        TEXT,
  cover_url       TEXT,
  paynow_email    TEXT,
  paynow_integration_key TEXT,
  bank_name       TEXT,
  bank_account    TEXT,
  is_approved     BOOLEAN DEFAULT false,
  approval_note   TEXT,
  total_revenue   NUMERIC(12,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────
-- CATEGORIES
-- ──────────────────────────────────────────────────────────
CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  slug  TEXT NOT NULL UNIQUE,
  icon  TEXT
);

INSERT INTO categories (name, slug, icon) VALUES
  ('Music', 'music', '🎵'),
  ('Sports', 'sports', '⚽'),
  ('Arts & Theatre', 'arts-theatre', '🎭'),
  ('Business', 'business', '💼'),
  ('Food & Drink', 'food-drink', '🍽️'),
  ('Nightlife', 'nightlife', '🌃'),
  ('Comedy', 'comedy', '😂'),
  ('Education', 'education', '📚'),
  ('Charity', 'charity', '❤️'),
  ('Other', 'other', '🎉');

-- ──────────────────────────────────────────────────────────
-- VENUES
-- ──────────────────────────────────────────────────────────
CREATE TABLE venues (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT NOT NULL DEFAULT 'Harare',
  country     TEXT NOT NULL DEFAULT 'Zimbabwe',
  lat         NUMERIC(10,7),
  lng         NUMERIC(10,7),
  capacity    INTEGER,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────
-- EVENTS
-- ──────────────────────────────────────────────────────────
CREATE TYPE event_status AS ENUM (
  'draft', 'pending_approval', 'published', 'cancelled', 'completed'
);

CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id    UUID NOT NULL REFERENCES organizer_profiles(id),
  category_id     INTEGER REFERENCES categories(id),
  venue_id        UUID REFERENCES venues(id),

  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  content         JSONB,
  cover_image_url TEXT,
  gallery_urls    TEXT[] DEFAULT '{}',

  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  doors_open_at   TIMESTAMPTZ,
  timezone        TEXT NOT NULL DEFAULT 'Africa/Harare',

  is_online       BOOLEAN DEFAULT false,
  online_url      TEXT,
  venue_address   TEXT,

  status          event_status DEFAULT 'draft',
  is_featured     BOOLEAN DEFAULT false,
  max_attendees   INTEGER,
  tags            TEXT[] DEFAULT '{}',
  meta_title      TEXT,
  meta_description TEXT,

  total_sold      INTEGER DEFAULT 0,
  total_revenue   NUMERIC(12,2) DEFAULT 0,

  approved_by     UUID REFERENCES profiles(id),
  approved_at     TIMESTAMPTZ,
  rejection_note  TEXT,

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Full-text search index
CREATE INDEX idx_events_fts ON events 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_starts_at ON events(starts_at);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_slug ON events(slug);

-- ──────────────────────────────────────────────────────────
-- TICKET TIERS
-- ──────────────────────────────────────────────────────────
CREATE TABLE ticket_tiers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  quantity        INTEGER NOT NULL,
  quantity_sold   INTEGER DEFAULT 0,
  max_per_order   INTEGER DEFAULT 10,
  min_per_order   INTEGER DEFAULT 1,
  sale_starts_at  TIMESTAMPTZ,
  sale_ends_at    TIMESTAMPTZ,
  is_visible      BOOLEAN DEFAULT true,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tiers_event ON ticket_tiers(event_id);

-- ──────────────────────────────────────────────────────────
-- ORDERS
-- ──────────────────────────────────────────────────────────
CREATE TYPE order_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
);

CREATE TYPE payment_provider AS ENUM ('paynow', 'stripe', 'free');

CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT UNIQUE NOT NULL,
  user_id           UUID NOT NULL REFERENCES profiles(id),
  event_id          UUID NOT NULL REFERENCES events(id),

  status            order_status DEFAULT 'pending',

  subtotal          NUMERIC(10,2) NOT NULL,
  service_fee       NUMERIC(10,2) DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL,
  currency          TEXT DEFAULT 'USD',

  payment_provider  payment_provider,
  payment_ref       TEXT,
  payment_status    TEXT,
  paid_at           TIMESTAMPTZ,

  attendee_name     TEXT,
  attendee_email    TEXT,
  attendee_phone    TEXT,

  ip_address        INET,
  user_agent        TEXT,
  notes             TEXT,

  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ──────────────────────────────────────────────────────────
-- TICKETS
-- ──────────────────────────────────────────────────────────
CREATE TABLE tickets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tier_id           UUID NOT NULL REFERENCES ticket_tiers(id),
  event_id          UUID NOT NULL REFERENCES events(id),
  user_id           UUID NOT NULL REFERENCES profiles(id),

  ticket_number     TEXT UNIQUE NOT NULL,
  qr_code           TEXT UNIQUE NOT NULL,
  qr_secret         TEXT NOT NULL,

  holder_name       TEXT,
  holder_email      TEXT,

  price_paid        NUMERIC(10,2) NOT NULL,
  currency          TEXT DEFAULT 'USD',

  is_checked_in     BOOLEAN DEFAULT false,
  checked_in_at     TIMESTAMPTZ,
  checked_in_by     UUID REFERENCES profiles(id),
  check_in_device   TEXT,

  is_transferred    BOOLEAN DEFAULT false,
  transferred_to    UUID REFERENCES profiles(id),
  transferred_at    TIMESTAMPTZ,

  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tickets_order ON tickets(order_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_qr ON tickets(qr_code);
CREATE INDEX idx_tickets_number ON tickets(ticket_number);

-- ──────────────────────────────────────────────────────────
-- SEAT HOLDS
-- ──────────────────────────────────────────────────────────
CREATE TABLE seat_holds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id     UUID NOT NULL REFERENCES ticket_tiers(id) ON DELETE CASCADE,
  session_id  TEXT NOT NULL,
  quantity    INTEGER NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_holds_tier ON seat_holds(tier_id);
CREATE INDEX idx_holds_expires ON seat_holds(expires_at);

-- ──────────────────────────────────────────────────────────
-- PAYOUTS
-- ──────────────────────────────────────────────────────────
CREATE TYPE payout_status AS ENUM (
  'pending', 'processing', 'completed', 'failed'
);

CREATE TABLE payouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id    UUID NOT NULL REFERENCES organizer_profiles(id),
  amount          NUMERIC(12,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  status          payout_status DEFAULT 'pending',
  reference       TEXT,
  notes           TEXT,
  processed_by    UUID REFERENCES profiles(id),
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────
-- WISHLISTS / SAVED EVENTS
-- ──────────────────────────────────────────────────────────
CREATE TABLE event_saves (
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  saved_at    TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);

-- ──────────────────────────────────────────────────────────
-- REVIEWS
-- ──────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id),
  order_id    UUID NOT NULL REFERENCES orders(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_visible  BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- ──────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ──────────────────────────────────────────────────────────
CREATE TYPE notification_type AS ENUM (
  'ticket_purchased', 'event_reminder', 'event_cancelled',
  'event_updated', 'payout_processed', 'review_received'
);

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifs_user ON notifications(user_id, is_read);

-- ──────────────────────────────────────────────────────────
-- PLATFORM SETTINGS
-- ──────────────────────────────────────────────────────────
CREATE TABLE platform_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO platform_settings (key, value) VALUES
  ('service_fee_percent', '5'),
  ('min_payout_amount', '10'),
  ('platform_currency', '"USD"');
