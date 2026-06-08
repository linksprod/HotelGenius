-- Fix: Add admin write policies (INSERT, UPDATE, DELETE) for core catalog tables
-- that were missing from previous RLS migrations:
--   restaurants, spa_facilities, shops, events
--
-- The SELECT-only "Public Read" policies were already applied, but no write policies
-- existed, causing AI import and admin CRUD operations to be silently blocked.

-- ─── GRANT table-level write permissions ────────────────────────────────────
GRANT INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.spa_facilities TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.shops TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;

-- ─── RESTAURANTS ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin Write Restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Admin Insert Restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Admin Update Restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Admin Delete Restaurants" ON public.restaurants;

CREATE POLICY "Admin Insert Restaurants" ON public.restaurants
  FOR INSERT
  WITH CHECK (public.can_access_hotel_data(hotel_id));

CREATE POLICY "Admin Update Restaurants" ON public.restaurants
  FOR UPDATE
  USING (public.can_access_hotel_data(hotel_id));

CREATE POLICY "Admin Delete Restaurants" ON public.restaurants
  FOR DELETE
  USING (public.can_access_hotel_data(hotel_id));

-- ─── SPA FACILITIES ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin Insert Spa Facilities" ON public.spa_facilities;
DROP POLICY IF EXISTS "Admin Update Spa Facilities" ON public.spa_facilities;
DROP POLICY IF EXISTS "Admin Delete Spa Facilities" ON public.spa_facilities;

CREATE POLICY "Admin Insert Spa Facilities" ON public.spa_facilities
  FOR INSERT
  WITH CHECK (public.can_access_hotel_data(hotel_id));

CREATE POLICY "Admin Update Spa Facilities" ON public.spa_facilities
  FOR UPDATE
  USING (public.can_access_hotel_data(hotel_id));

CREATE POLICY "Admin Delete Spa Facilities" ON public.spa_facilities
  FOR DELETE
  USING (public.can_access_hotel_data(hotel_id));

-- ─── SHOPS ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin Insert Shops" ON public.shops;
DROP POLICY IF EXISTS "Admin Update Shops" ON public.shops;
DROP POLICY IF EXISTS "Admin Delete Shops" ON public.shops;

CREATE POLICY "Admin Insert Shops" ON public.shops
  FOR INSERT
  WITH CHECK (public.can_access_hotel_data(hotel_id));

CREATE POLICY "Admin Update Shops" ON public.shops
  FOR UPDATE
  USING (public.can_access_hotel_data(hotel_id));

CREATE POLICY "Admin Delete Shops" ON public.shops
  FOR DELETE
  USING (public.can_access_hotel_data(hotel_id));

-- ─── EVENTS ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin Insert Events" ON public.events;
DROP POLICY IF EXISTS "Admin Update Events" ON public.events;
DROP POLICY IF EXISTS "Admin Delete Events" ON public.events;

CREATE POLICY "Admin Insert Events" ON public.events
  FOR INSERT
  WITH CHECK (public.can_access_hotel_data(hotel_id));

CREATE POLICY "Admin Update Events" ON public.events
  FOR UPDATE
  USING (public.can_access_hotel_data(hotel_id));

CREATE POLICY "Admin Delete Events" ON public.events
  FOR DELETE
  USING (public.can_access_hotel_data(hotel_id));
