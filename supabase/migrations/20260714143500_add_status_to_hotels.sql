-- Add status column to hotels table
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'essai_en_cours';
