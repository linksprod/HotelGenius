-- ────────────────────────────────────────────────────────────────
-- Add color columns to hotels table
-- ────────────────────────────────────────────────────────────────

DO $$
BEGIN
    -- Add primary_color if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'hotels' AND column_name = 'primary_color'
    ) THEN
        ALTER TABLE public.hotels ADD COLUMN primary_color TEXT DEFAULT '#94b3a3';
    END IF;

    -- Add secondary_color if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'hotels' AND column_name = 'secondary_color'
    ) THEN
        ALTER TABLE public.hotels ADD COLUMN secondary_color TEXT DEFAULT '#1a1a1a';
    END IF;
END $$;

-- ────────────────────────────────────────────────────────────────
-- Update get_hotel_by_slug RPC to include colors
-- ────────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.get_hotel_by_slug(TEXT);

CREATE OR REPLACE FUNCTION public.get_hotel_by_slug(p_slug TEXT)
RETURNS TABLE(
  id               UUID,
  name             TEXT,
  slug             TEXT,
  logo_url         TEXT,
  primary_color    TEXT,
  secondary_color  TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    h.id, 
    h.name, 
    h.slug, 
    h.logo_url,
    h.primary_color,
    h.secondary_color
  FROM public.hotels h
  WHERE h.slug = p_slug
  LIMIT 1;
$$;

-- Ensure permissions are set
GRANT EXECUTE ON FUNCTION public.get_hotel_by_slug(TEXT) TO anon, authenticated;
