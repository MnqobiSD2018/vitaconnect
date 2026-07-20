-- ============================================================
-- MIGRATION: 0008_rls_fixes.sql
-- Add missing RLS policies for event_saves and tickets
-- ============================================================

-- EVENT_SAVES: INSERT policy
CREATE POLICY "Users can save events"
  ON event_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- EVENT_SAVES: SELECT policy
CREATE POLICY "Users can view own saved events"
  ON event_saves FOR SELECT
  USING (auth.uid() = user_id);

-- EVENT_SAVES: DELETE policy
CREATE POLICY "Users can remove own saved events"
  ON event_saves FOR DELETE
  USING (auth.uid() = user_id);

-- TICKETS: INSERT policy (allows server actions to insert tickets for the authenticated user)
CREATE POLICY "Users can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);
