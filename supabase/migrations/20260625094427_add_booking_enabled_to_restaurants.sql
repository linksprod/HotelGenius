-- Add booking_enabled column to restaurants table to allow enabling/disabling book a table button
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN DEFAULT true;
