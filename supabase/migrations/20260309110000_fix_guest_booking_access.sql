-- ================================================================
-- FIX: Guest access to own bookings and requests
--
-- Problem: 
--   Tenant Isolation policies use public.can_access_hotel_data(),
--   which returns FALSE for guests. This prevents guests from
--   reading their own bookings/requests even if they created them.
--
-- Solution:
--   Add explicit policies for guests to access their own records
--   based on user_id / guest_id columns.
-- ================================================================

-- 1. Spa Bookings
DROP POLICY IF EXISTS "Guests can view own spa bookings" ON public.spa_bookings;
CREATE POLICY "Guests can view own spa bookings"
ON public.spa_bookings FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Guests can insert own spa bookings" ON public.spa_bookings;
CREATE POLICY "Guests can insert own spa bookings"
ON public.spa_bookings FOR INSERT
WITH CHECK (user_id = auth.uid() OR auth.role() = 'authenticated');

-- 2. Table Reservations
DROP POLICY IF EXISTS "Guests can view own table reservations" ON public.table_reservations;
CREATE POLICY "Guests can view own table reservations"
ON public.table_reservations FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Guests can insert own table reservations" ON public.table_reservations;
CREATE POLICY "Guests can insert own table reservations"
ON public.table_reservations FOR INSERT
WITH CHECK (user_id = auth.uid() OR auth.role() = 'authenticated');

-- 3. Event Reservations
DROP POLICY IF EXISTS "Guests can view own event reservations" ON public.event_reservations;
CREATE POLICY "Guests can view own event reservations"
ON public.event_reservations FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Guests can insert own event reservations" ON public.event_reservations;
CREATE POLICY "Guests can insert own event reservations"
ON public.event_reservations FOR INSERT
WITH CHECK (user_id = auth.uid() OR auth.role() = 'authenticated');

-- 4. Service Requests
DROP POLICY IF EXISTS "Guests can view own service requests" ON public.service_requests;
CREATE POLICY "Guests can view own service requests"
ON public.service_requests FOR SELECT
USING (guest_id = auth.uid());

DROP POLICY IF EXISTS "Guests can insert own service requests" ON public.service_requests;
CREATE POLICY "Guests can insert own service requests"
ON public.service_requests FOR INSERT
WITH CHECK (guest_id = auth.uid() OR auth.role() = 'authenticated');
