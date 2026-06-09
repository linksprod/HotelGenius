-- Fix: Change is_published default to true for all catalog tables
-- This ensures newly created items are visible to guests immediately.
-- All existing items with is_published = false are also published.

ALTER TABLE public.restaurants ALTER COLUMN is_published SET DEFAULT true;
ALTER TABLE public.spa_services ALTER COLUMN is_published SET DEFAULT true;
ALTER TABLE public.spa_facilities ALTER COLUMN is_published SET DEFAULT true;
ALTER TABLE public.rooms ALTER COLUMN is_published SET DEFAULT true;

-- Publish all existing items that were created with the old default (false)
UPDATE public.restaurants SET is_published = true WHERE is_published IS NULL OR is_published = false;
UPDATE public.spa_services SET is_published = true WHERE is_published IS NULL OR is_published = false;
UPDATE public.spa_facilities SET is_published = true WHERE is_published IS NULL OR is_published = false;
UPDATE public.rooms SET is_published = true WHERE is_published IS NULL OR is_published = false;
