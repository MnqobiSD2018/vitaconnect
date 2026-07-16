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

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

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
