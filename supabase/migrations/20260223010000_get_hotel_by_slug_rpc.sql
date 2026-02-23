-- ================================================================
-- Create a SECURITY DEFINER function to fetch hotel by slug
-- Only selects columns that exist in the production hotels table
-- (primary_color excluded as it may not exist yet)
-- ================================================================
CREATE OR REPLACE FUNCTION public.get_hotel_by_slug(p_slug TEXT)
RETURNS TABLE(
  id       UUID,
  name     TEXT,
  slug     TEXT,
  logo_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT h.id, h.name, h.slug, h.logo_url
  FROM public.hotels h
  WHERE h.slug = p_slug
  LIMIT 1;
$$;

-- Allow both unauthenticated guests and authenticated users to call this
GRANT EXECUTE ON FUNCTION public.get_hotel_by_slug(TEXT) TO anon, authenticated;
