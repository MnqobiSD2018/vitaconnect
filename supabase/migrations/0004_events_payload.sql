-- ============================================================
-- MIGRATION: 0004_events_payload.sql
-- Backwards-compatible events payload table used for dev seeding and
-- quick imports. Stores raw event JSON in `payload` column.
-- ============================================================

CREATE TABLE events_payload (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payload         JSONB NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_payload_created ON events_payload(created_at DESC);
