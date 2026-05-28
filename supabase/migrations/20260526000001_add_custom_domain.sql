-- ================================================================
-- Phase 2A: Add custom domain support to hotels table
-- ================================================================

ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS domain_verified boolean DEFAULT false;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'essential';
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS api_key text UNIQUE DEFAULT 'hg_' || replace(gen_random_uuid()::text, '-', '');

-- Index for fast custom domain lookups
CREATE INDEX IF NOT EXISTS hotels_custom_domain_idx ON public.hotels(custom_domain);
CREATE INDEX IF NOT EXISTS hotels_api_key_idx ON public.hotels(api_key);
