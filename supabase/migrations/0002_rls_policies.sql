-- ============================================================
-- MIGRATION: 0002_rls_policies.sql
-- ============================================================

-- Enable RLS on tables
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
