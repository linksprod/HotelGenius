-- ================================================================
-- Phase 3A: Guest Digital Twin — AI-injectable preference snapshots
-- ================================================================

CREATE TABLE IF NOT EXISTS public.guest_digital_twin (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id    uuid NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  hotel_id    uuid REFERENCES public.hotels(id) ON DELETE SET NULL,
  snapshot    jsonb NOT NULL DEFAULT '{}',
  updated_at  timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS guest_twin_unique_idx
  ON public.guest_digital_twin(guest_id, hotel_id);

CREATE INDEX IF NOT EXISTS guest_twin_guest_idx
  ON public.guest_digital_twin(guest_id);

ALTER TABLE public.guest_digital_twin ENABLE ROW LEVEL SECURITY;

-- Staff and service role can read
CREATE POLICY "staff_read_twin" ON public.guest_digital_twin
  FOR SELECT USING (true);

-- Only service role can insert/update (edge functions use service key)
CREATE POLICY "service_write_twin" ON public.guest_digital_twin
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE public.guest_digital_twin IS
  'AI-injectable guest preference snapshot. Aggregated from guest_preferences, spa_bookings, table_reservations, event_reservations. Injected into every AI conversation system prompt.';
