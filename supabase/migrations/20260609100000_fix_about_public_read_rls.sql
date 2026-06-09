-- ================================================================
-- FIX: Grant public read access to hotel_about for guest-facing About page
-- The table was previously protected by can_access_hotel_data() which
-- requires a user_role entry — blocking anonymous/guest users.
-- ================================================================

-- 1. Grant table-level SELECT to anon + authenticated roles
GRANT SELECT ON public.hotel_about TO anon, authenticated;

-- 2. Drop the restrictive admin-only SELECT policy
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.hotel_about;

-- 3. Create a public read policy (like other guest-facing tables)
--    The app layer always filters by hotel_id, so tenant isolation is preserved.
CREATE POLICY "Public Read Hotel About" ON public.hotel_about
  FOR SELECT USING (true);

-- Keep write policies intact (only admins can INSERT/UPDATE/DELETE)
