-- ============================================================
-- MIGRATION: 0007_notifications_and_reminders.sql
-- Adds new notification types for event approval, rejection,
-- and creates a helper function for notification creation.
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1) Extend notification_type enum
-- ──────────────────────────────────────────────────────────
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'event_approved';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'event_rejected';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'order_cancelled';

-- ──────────────────────────────────────────────────────────
-- 2) Helper function to create notifications
--    Usage: PERFORM create_notification(user_id, type, title, body, data)
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────────────────
-- 3) Add is_cancelled column to tickets for soft cancellation
-- ──────────────────────────────────────────────────────────
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT false;

-- ──────────────────────────────────────────────────────────
-- 4) Helper function to decrement tier quantity on cancellation
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION decrement_tier_quantity(p_tier_id UUID, p_count INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE ticket_tiers SET
    quantity_sold = GREATEST(0, quantity_sold - p_count)
  WHERE id = p_tier_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────────────────
-- 5) Create a cron job for event reminders
--    Runs daily at 8am, sends reminders for events starting
--    the next day. The actual email sending is handled by
--    the /api/cron/event-reminders endpoint.
-- ──────────────────────────────────────────────────────────
SELECT cron.schedule(
  'send-event-reminders',
  '0 8 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.api_base_url', true) || '/api/cron/event-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret', true))
  )$$
);
