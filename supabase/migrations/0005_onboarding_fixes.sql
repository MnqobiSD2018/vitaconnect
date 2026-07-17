-- ============================================================
-- MIGRATION: 0005_onboarding_fixes.sql
-- Adds missing columns to organizer_profiles
-- Seeds a test organizer user for onboarding flow testing
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────
-- 1) Add missing columns to organizer_profiles
-- ──────────────────────────────────────────────────────────
ALTER TABLE organizer_profiles
  ADD COLUMN IF NOT EXISTS phone               TEXT,
  ADD COLUMN IF NOT EXISTS business_type       TEXT,
  ADD COLUMN IF NOT EXISTS organizer_category  TEXT,
  ADD COLUMN IF NOT EXISTS years_in_business   TEXT,
  ADD COLUMN IF NOT EXISTS country             TEXT DEFAULT 'Zimbabwe',
  ADD COLUMN IF NOT EXISTS city                TEXT,
  ADD COLUMN IF NOT EXISTS physical_address    TEXT,
  ADD COLUMN IF NOT EXISTS trading_name        TEXT,
  ADD COLUMN IF NOT EXISTS account_name        TEXT,
  ADD COLUMN IF NOT EXISTS branch              TEXT,
  ADD COLUMN IF NOT EXISTS mobile_money        TEXT,
  ADD COLUMN IF NOT EXISTS ecocash             TEXT,
  ADD COLUMN IF NOT EXISTS stripe_account      TEXT,
  ADD COLUMN IF NOT EXISTS paypal_email        TEXT;

-- ──────────────────────────────────────────────────────────
-- 2) Seed a test organizer (email confirmed, pre-onboarding)
--    Password: Test123!
--    The DB trigger handle_new_user() creates a profile row
--    with role DEFAULT 'attendee', so signIn will detect
--    intendedRole=organizer + no organizer_profile and send
--    the user to the /onboarding wizard.
-- ──────────────────────────────────────────────────────────
-- NOTE: confirmed_at (col 27) is a GENERATED ALWAYS column,
--       excluded from INSERT.
-- ──────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'testorganizer@vitaconnect.co.zw') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role,
      email, encrypted_password, email_confirmed_at,
      invited_at,
      confirmation_token, confirmation_sent_at,
      recovery_token, recovery_sent_at,
      email_change_token_new, email_change, email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin,
      created_at, updated_at,
      phone, phone_confirmed_at,
      phone_change, phone_change_token, phone_change_sent_at,
      email_change_token_current, email_change_confirm_status,
      banned_until,
      reauthentication_token, reauthentication_sent_at,
      is_sso_user, deleted_at, is_anonymous
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated', 'authenticated',
      'testorganizer@vitaconnect.co.zw',
      crypt('Test123!', gen_salt('bf')),
      now(),
      NULL,
      '', now(),
      '', now(),
      '', '', NULL,
      NULL,
      jsonb_build_object('provider', 'email'),
      jsonb_build_object('full_name', 'Test Organizer', 'role', 'organizer'),
      false,
      now(), now(),
      NULL, NULL,
      '', '', NULL,
      '', 0,
      NULL,
      '', NULL,
      false, NULL, false
    );

    -- Ensure profile exists (trigger should have fired, but be safe)
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (v_user_id, 'Test Organizer', NULL, 'attendee')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
