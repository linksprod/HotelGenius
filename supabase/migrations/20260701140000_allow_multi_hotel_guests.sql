-- Migration to allow a user (same user_id/email) to be a guest in multiple hotels.
-- We replace the single-column unique constraint/index on user_id with a composite unique index on (user_id, hotel_id).

-- 1. Drop existing user_id unique constraints/indices
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_user_id_key;
DROP INDEX IF EXISTS public.idx_guests_user_id_unique;

-- 2. Create the new composite unique constraint/index on (user_id, hotel_id)
-- We create a standard unique index on (user_id, hotel_id) which is fully supported for upsert.
DROP INDEX IF EXISTS public.idx_guests_user_id_hotel_id_unique;
CREATE UNIQUE INDEX idx_guests_user_id_hotel_id_unique ON public.guests (user_id, hotel_id);
