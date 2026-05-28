ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false;
