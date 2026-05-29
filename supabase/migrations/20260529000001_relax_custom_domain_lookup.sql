-- Relax domain_verified restriction in get_hotel_by_slug
-- Since Vercel handles the actual domain verification and routing, if a request reaches our app
-- with a specific custom_domain, we can safely serve it.

DROP FUNCTION IF EXISTS public.get_hotel_by_slug(text, text);

CREATE OR REPLACE FUNCTION public.get_hotel_by_slug(
  p_slug         text,
  p_custom_domain text DEFAULT NULL
)
RETURNS TABLE(
  id              uuid,
  name            text,
  slug            text,
  logo_url        text,
  primary_color   text,
  secondary_color text,
  custom_domain   text,
  domain_verified boolean,
  plan            text,
  active_modules  text[]
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Try custom domain first if provided (removed domain_verified = true restriction)
  IF p_custom_domain IS NOT NULL AND p_custom_domain != '' THEN
    RETURN QUERY
      SELECT h.id, h.name, h.slug, h.logo_url, h.primary_color, h.secondary_color,
             h.custom_domain, h.domain_verified, h.plan, h.active_modules
      FROM public.hotels h
      WHERE h.custom_domain = p_custom_domain
      LIMIT 1;
    IF FOUND THEN RETURN; END IF;
  END IF;

  -- Fall back to slug lookup
  RETURN QUERY
    SELECT h.id, h.name, h.slug, h.logo_url, h.primary_color, h.secondary_color,
           h.custom_domain, h.domain_verified, h.plan, h.active_modules
    FROM public.hotels h
    WHERE h.slug = p_slug
    LIMIT 1;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_hotel_by_slug(text, text) TO anon, authenticated;
