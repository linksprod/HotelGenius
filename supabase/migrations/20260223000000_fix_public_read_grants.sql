-- ================================================================
-- FIX: Grant public read access to guest-facing catalog tables
-- Self-contained — no external function dependencies.
-- Safe to run multiple times (all DROP IF EXISTS).
-- ================================================================

-- 0. HOTELS: guests must be able to resolve the hotel by slug
--    (HotelContext fetches hotels table with the anon key)
GRANT SELECT ON public.hotels TO anon, authenticated;

DROP POLICY IF EXISTS "Public can view hotels by slug" ON public.hotels;
CREATE POLICY "Public can view hotels by slug" ON public.hotels
  FOR SELECT USING (true);

-- 1. Grant table-level SELECT to anon + authenticated roles
--    (RLS USING(true) alone is not sufficient without GRANT)
GRANT SELECT ON public.restaurants TO anon, authenticated;
GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT ON public.spa_services TO anon, authenticated;
GRANT SELECT ON public.spa_facilities TO anon, authenticated;
GRANT SELECT ON public.shops TO anon, authenticated;
GRANT SELECT ON public.shop_categories TO anon, authenticated;
GRANT SELECT ON public.shop_products TO anon, authenticated;
GRANT SELECT ON public.restaurant_menus TO anon, authenticated;

-- ----------------------------------------------------------------
-- 2. RESTAURANTS
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.restaurants;
DROP POLICY IF EXISTS "Public Read Restaurants" ON public.restaurants;

-- Allow all users (including unauthenticated guests) to read restaurants.
-- The app layer filters by hotel_id — each hotel only shows its own.
CREATE POLICY "Public Read Restaurants" ON public.restaurants
  FOR SELECT USING (true);

-- ----------------------------------------------------------------
-- 3. EVENTS
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.events;
DROP POLICY IF EXISTS "Public Read Events" ON public.events;

CREATE POLICY "Public Read Events" ON public.events
  FOR SELECT USING (true);

-- ----------------------------------------------------------------
-- 4. SPA SERVICES & FACILITIES
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.spa_services;
DROP POLICY IF EXISTS "Public Read Spa Services" ON public.spa_services;
CREATE POLICY "Public Read Spa Services" ON public.spa_services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.spa_facilities;
DROP POLICY IF EXISTS "Public Read Spa Facilities" ON public.spa_facilities;
CREATE POLICY "Public Read Spa Facilities" ON public.spa_facilities
  FOR SELECT USING (true);

-- ----------------------------------------------------------------
-- 5. SHOPS, CATEGORIES, PRODUCTS
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.shops;
DROP POLICY IF EXISTS "Public Read Shops" ON public.shops;
CREATE POLICY "Public Read Shops" ON public.shops
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.shop_categories;
DROP POLICY IF EXISTS "Public Read Shop Categories" ON public.shop_categories;
CREATE POLICY "Public Read Shop Categories" ON public.shop_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.shop_products;
DROP POLICY IF EXISTS "Public Read Shop Products" ON public.shop_products;
CREATE POLICY "Public Read Shop Products" ON public.shop_products
  FOR SELECT USING (true);

-- ----------------------------------------------------------------
-- 6. RESTAURANT MENUS
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.restaurant_menus;
DROP POLICY IF EXISTS "Public Read Restaurant Menus" ON public.restaurant_menus;
CREATE POLICY "Public Read Restaurant Menus" ON public.restaurant_menus
  FOR SELECT USING (true);
