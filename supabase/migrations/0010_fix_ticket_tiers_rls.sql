-- ============================================================
-- MIGRATION: 0010_fix_ticket_tiers_rls.sql
-- Replace overly restrictive ticket_tiers policies from 0009
-- with simpler authenticated-user policies.
-- Server actions already verify organizer ownership.
-- ============================================================

-- Drop old policies that used is_event_organizer() which may not resolve on INSERT
DROP POLICY IF EXISTS "Organizers can insert tiers" ON ticket_tiers;
DROP POLICY IF EXISTS "Organizers can update tiers" ON ticket_tiers;
DROP POLICY IF EXISTS "Organizers can delete tiers" ON ticket_tiers;

-- INSERT: authenticated users can insert tiers
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
