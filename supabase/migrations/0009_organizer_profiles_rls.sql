-- ============================================================
-- MIGRATION: 0009_organizer_profiles_rls.sql
-- Add missing RLS policies for organizer_profiles table.
-- RLS was enabled in 0002 but no policies were created,
-- causing 403 on INSERT/UPDATE/SELECT during onboarding.
-- ============================================================

-- INSERT: authenticated users can create their own organizer profile
CREATE POLICY "Organizers can create own profile"
  ON organizer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: organizers can update their own profile
CREATE POLICY "Organizers can update own profile"
  ON organizer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- SELECT: organizers can view their own profile
CREATE POLICY "Organizers can view own profile"
  ON organizer_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- SELECT: public can view organizer profiles (for public event pages)
CREATE POLICY "Public can view organizer profiles"
  ON organizer_profiles FOR SELECT
  USING (true);

-- ============================================================
-- TICKET TIERS
-- RLS enabled in 0002 but only SELECT policy existed.
-- The server actions (updateEvent) already verify the user
-- owns the event, so RLS just needs to require authentication.
-- ============================================================

-- INSERT: authenticated users can insert tiers (server action verifies ownership)
CREATE POLICY "Authenticated can insert tiers"
  ON ticket_tiers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: authenticated users can update tiers
CREATE POLICY "Authenticated can update tiers"
  ON ticket_tiers FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- DELETE: authenticated users can delete tiers
CREATE POLICY "Authenticated can delete tiers"
  ON ticket_tiers FOR DELETE
  USING (auth.uid() IS NOT NULL);
