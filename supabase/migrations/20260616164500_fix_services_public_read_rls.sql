-- ================================================================
-- FIX: Grant public read access to request_categories and request_items for guest-facing services/search
-- The tables were previously protected by can_access_hotel_data() which
-- requires a user_role entry — blocking anonymous/guest users.
-- ================================================================

-- 1. Grant table-level SELECT to anon + authenticated roles
GRANT SELECT ON public.request_categories TO anon, authenticated;
GRANT SELECT ON public.request_items TO anon, authenticated;

-- 2. Drop the restrictive admin-only SELECT policy
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.request_categories;
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.request_items;

-- 3. Create a public read policy (like other guest-facing tables)
--    The app layer always filters by hotel_id, so tenant isolation is preserved.
CREATE POLICY "Public Read Request Categories" ON public.request_categories
  FOR SELECT USING (true);

CREATE POLICY "Public Read Request Items" ON public.request_items
  FOR SELECT USING (true);
