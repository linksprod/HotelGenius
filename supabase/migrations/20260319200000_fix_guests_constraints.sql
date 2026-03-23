-- Add unique constraint to guests(user_id) to allow upserts
-- and ensure hotel_id is optional for platform-level guest records
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_user_id_key;
ALTER TABLE public.guests ADD CONSTRAINT guests_user_id_key UNIQUE (user_id);

-- Ensure hotel_id is nullable if it isn't already (for super admin global records)
ALTER TABLE public.guests ALTER COLUMN hotel_id DROP NOT NULL;

-- Repair any existing duplicates that might prevent the constraint (keeping the most recent)
DELETE FROM public.guests a USING public.guests b
WHERE a.id < b.id AND a.user_id = b.user_id;
