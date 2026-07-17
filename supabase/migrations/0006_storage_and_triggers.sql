-- ============================================================
-- MIGRATION: 0006_storage_and_triggers.sql
-- Creates Supabase storage bucket for event assets
-- Fixes double-counting: triggers now also update total_sold
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1) Create storage bucket for event assets (images, etc.)
-- ──────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('event-assets', 'event-assets', true, false, 52428800, '{"image/*","application/pdf"}')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────
-- 2) Allow public access to event-assets bucket
-- ──────────────────────────────────────────────────────────
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-assets');

CREATE POLICY "Authenticated Upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-assets'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Owner Delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'event-assets'
    AND owner = auth.uid()
  );

-- ──────────────────────────────────────────────────────────
-- 3) Fix update_event_totals to also update total_sold
--    Previously only incremented total_revenue and
--    quantity_sold, missing total_sold on events.
--    Manual updates in createOrder() removed to prevent
--    double-counting — this trigger is now the sole
--    mechanism for maintaining these counters.
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_event_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE events SET
      total_revenue = total_revenue + NEW.total,
      total_sold = total_sold + (SELECT COUNT(*) FROM tickets WHERE order_id = NEW.id),
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
