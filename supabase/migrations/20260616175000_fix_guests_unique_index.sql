-- Migration to replace the partial unique index on public.guests(user_id) with a full unique index.
-- This allows ON CONFLICT (user_id) to match the unique constraint during guest upserts.

DROP INDEX IF EXISTS public.idx_guests_user_id_unique;
CREATE UNIQUE INDEX idx_guests_user_id_unique ON public.guests (user_id);
