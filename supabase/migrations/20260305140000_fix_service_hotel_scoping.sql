-- ================================================================
-- FIX: Multi-tenancy scoping for service reservations and requests
--
-- Why: Some records (table_reservations, spa_bookings, etc.) might 
--      have NULL hotel_id if they were created before the trigger
--      was updated or during edge cases.
--
-- Solution: 
--   1. Back-fill hotel_id by joining with parent tables 
--      (restaurants, spa_services, etc.) which carry the hotel_id.
--   2. Ensure the auto_set_hotel_id trigger is correctly applied.
-- ================================================================

-- 1. Back-fill table_reservations via restaurants
UPDATE public.table_reservations tr
SET hotel_id = r.hotel_id
FROM public.restaurants r
WHERE tr.restaurant_id = r.id
  AND tr.hotel_id IS NULL
  AND r.hotel_id IS NOT NULL;

-- 2. Back-fill spa_bookings via spa_services
UPDATE public.spa_bookings sb
SET hotel_id = ss.hotel_id
FROM public.spa_services ss
WHERE sb.service_id = ss.id
  AND sb.hotel_id IS NULL
  AND ss.hotel_id IS NOT NULL;

-- 3. Back-fill event_reservations via events
UPDATE public.event_reservations er
SET hotel_id = e.hotel_id
FROM public.events e
WHERE er.event_id = e.id
  AND er.hotel_id IS NULL
  AND e.hotel_id IS NOT NULL;

-- 4. Back-fill service_requests via request_items
UPDATE public.service_requests sr
SET hotel_id = ri.hotel_id
FROM public.request_items ri
WHERE sr.request_item_id = ri.id
  AND sr.hotel_id IS NULL
  AND ri.hotel_id IS NOT NULL;

-- 5. Back-fill guest_feedback via guests
UPDATE public.guest_feedback gf
SET hotel_id = g.hotel_id
FROM public.guests g
WHERE gf.guest_id = g.user_id
  AND gf.hotel_id IS NULL
  AND g.hotel_id IS NOT NULL;

-- 6. Ensure the trigger is robust (redundancy check if not already applied)
-- The function was updated in previous migration 20260305120000_fix_chat_hotel_scoping.sql
-- We just need to make sure it's linked for these tables (it already is via 20260223020000_auto_hotel_id_trigger.sql)
