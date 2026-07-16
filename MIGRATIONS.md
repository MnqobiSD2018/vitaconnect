Database Schema (Supabase / PostgreSQL)
Core Tables
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
  paynow_email    TEXT,            -- Paynow merchant email
  paynow_integration_key TEXT,     -- Encrypted: Paynow integration key
  bank_name       TEXT,
  bank_account    TEXT,            -- Encrypted
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
  description     TEXT,             -- Plain text
  content         JSONB,            -- Rich text as JSON (TipTap output)
  cover_image_url TEXT,
  gallery_urls    TEXT[] DEFAULT '{}',

  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  doors_open_at   TIMESTAMPTZ,
  timezone        TEXT NOT NULL DEFAULT 'Africa/Harare',

  is_online       BOOLEAN DEFAULT false,
  online_url      TEXT,             -- Revealed after ticket purchase
  venue_address   TEXT,             -- Fallback if no venue_id

  status          event_status DEFAULT 'draft',
  is_featured     BOOLEAN DEFAULT false,
  max_attendees   INTEGER,          -- Soft cap (sum of tier capacities)
  
  tags            TEXT[] DEFAULT '{}',
  
  -- SEO
  meta_title      TEXT,
  meta_description TEXT,

  -- Stats (denormalized for performance)
  total_sold      INTEGER DEFAULT 0,
  total_revenue   NUMERIC(12,2) DEFAULT 0,

  -- Approval
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
  name            TEXT NOT NULL,        -- e.g. "General", "VIP", "VVIP"
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  quantity        INTEGER NOT NULL,     -- Total available
  quantity_sold   INTEGER DEFAULT 0,    -- Denormalized for fast availability checks
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
  order_number      TEXT UNIQUE NOT NULL,  -- Human-readable: VTC-2025-00001
  user_id           UUID NOT NULL REFERENCES profiles(id),
  event_id          UUID NOT NULL REFERENCES events(id),

  status            order_status DEFAULT 'pending',

  -- Amounts
  subtotal          NUMERIC(10,2) NOT NULL,
  service_fee       NUMERIC(10,2) DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL,
  currency          TEXT DEFAULT 'USD',

  -- Payment
  payment_provider  payment_provider,
  payment_ref       TEXT,            -- Paynow poll URL or Stripe PaymentIntent ID
  payment_status    TEXT,            -- Raw status from payment provider
  paid_at           TIMESTAMPTZ,

  -- Attendee contact (for guest checkout or different purchaser)
  attendee_name     TEXT,
  attendee_email    TEXT,
  attendee_phone    TEXT,

  -- Metadata
  ip_address        INET,
  user_agent        TEXT,
  notes             TEXT,            -- Internal admin notes

  expires_at        TIMESTAMPTZ,     -- For seat holds (15 min timeout)
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ──────────────────────────────────────────────────────────
-- TICKETS (individual ticket items within an order)
-- ──────────────────────────────────────────────────────────
CREATE TABLE tickets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tier_id           UUID NOT NULL REFERENCES ticket_tiers(id),
  event_id          UUID NOT NULL REFERENCES events(id),
  user_id           UUID NOT NULL REFERENCES profiles(id),

  ticket_number     TEXT UNIQUE NOT NULL,    -- VTC-TKT-XXXXXXXX
  qr_code           TEXT UNIQUE NOT NULL,    -- Signed QR payload
  qr_secret         TEXT NOT NULL,           -- HMAC secret for verification

  -- Holder info (may differ from purchaser)
  holder_name       TEXT,
  holder_email      TEXT,

  price_paid        NUMERIC(10,2) NOT NULL,
  currency          TEXT DEFAULT 'USD',

  is_checked_in     BOOLEAN DEFAULT false,
  checked_in_at     TIMESTAMPTZ,
  checked_in_by     UUID REFERENCES profiles(id),  -- Scanner's user ID
  check_in_device   TEXT,                           -- Device identifier

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
-- SEAT HOLDS (prevents double-booking during checkout)
-- ──────────────────────────────────────────────────────────
CREATE TABLE seat_holds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id     UUID NOT NULL REFERENCES ticket_tiers(id) ON DELETE CASCADE,
  session_id  TEXT NOT NULL,     -- Anonymous session or user_id
  quantity    INTEGER NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_holds_tier ON seat_holds(tier_id);
CREATE INDEX idx_holds_expires ON seat_holds(expires_at);

-- ──────────────────────────────────────────────────────────
-- PAYOUTS (organizer withdrawals)
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
  reference       TEXT,           -- Bank transfer ref or Paynow ref
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
  order_id    UUID NOT NULL REFERENCES orders(id),  -- Must have attended
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_visible  BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)   -- One review per event per user
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
-- PLATFORM SETTINGS (key-value config store)
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
Key SQL Functions & Triggers
-- ============================================================
-- MIGRATION: 0003_functions.sql
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'VTC-' || TO_CHAR(now(), 'YYYY') || '-' ||
    LPAD(nextval('order_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Available seats calculation (respects active holds)
CREATE OR REPLACE FUNCTION get_available_quantity(p_tier_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total    INTEGER;
  v_sold     INTEGER;
  v_held     INTEGER;
BEGIN
  SELECT quantity, quantity_sold INTO v_total, v_sold
  FROM ticket_tiers WHERE id = p_tier_id;

  SELECT COALESCE(SUM(quantity), 0) INTO v_held
  FROM seat_holds
  WHERE tier_id = p_tier_id AND expires_at > now();

  RETURN GREATEST(0, v_total - v_sold - v_held);
END;
$$ LANGUAGE plpgsql;

-- Clean up expired seat holds (run via pg_cron every 5 mins)
SELECT cron.schedule(
  'cleanup-expired-holds',
  '*/5 * * * *',
  $$DELETE FROM seat_holds WHERE expires_at < now()$$
);

-- Update event totals after order completes
CREATE OR REPLACE FUNCTION update_event_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE events SET
      total_revenue = total_revenue + NEW.total,
      updated_at = now()
    WHERE id = NEW.event_id;

    UPDATE ticket_tiers tt SET
      quantity_sold = quantity_sold + t.cnt
    FROM (
      SELECT tier_id, COUNT(*) as cnt
      FROM tickets WHERE order_id = NEW.id
      GROUP BY tier_id
    ) t
    WHERE tt.id = t.tier_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_completed
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_event_totals();
Row Level Security (RLS)
-- ============================================================
-- MIGRATION: 0002_rls_policies.sql
-- ============================================================

-- Enable RLS on every public table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_saves ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user is organizer of an event
CREATE OR REPLACE FUNCTION is_event_organizer(p_event_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM events e
    JOIN organizer_profiles op ON op.id = e.organizer_id
    WHERE e.id = p_event_id AND op.user_id = auth.uid()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- EVENTS
CREATE POLICY "Published events are public"
  ON events FOR SELECT USING (status = 'published');

CREATE POLICY "Organizers see own events"
  ON events FOR SELECT USING (
    is_event_organizer(id) OR is_admin()
  );

CREATE POLICY "Organizers can insert events"
  ON events FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizer_profiles
      WHERE user_id = auth.uid() AND is_approved = true
    )
  );

CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE USING (is_event_organizer(id) OR is_admin());

-- TICKET TIERS
CREATE POLICY "Tiers are viewable if event is published"
  ON ticket_tiers FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND status = 'published'
    ) OR is_event_organizer(event_id) OR is_admin()
  );

-- ORDERS
CREATE POLICY "Users see own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_event_organizer(event_id) OR is_admin());

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TICKETS
CREATE POLICY "Users see own tickets"
  ON tickets FOR SELECT
  USING (auth.uid() = user_id OR is_event_organizer(event_id) OR is_admin());

-- NOTIFICATIONS
CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);
