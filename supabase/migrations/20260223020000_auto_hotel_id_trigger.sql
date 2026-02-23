-- ================================================================
-- TRIGGER: Auto-set hotel_id on INSERT for multi-tenant tables
-- 
-- WHY: PostgREST schema cache does not recognize 'hotel_id' columns
-- added via ALTER TABLE migrations. Passing hotel_id from the client
-- causes: "Could not find the 'hotel_id' column in the schema cache".
--
-- SOLUTION: Remove hotel_id from all INSERT payloads on the client side.
-- This trigger fires BEFORE INSERT and fills hotel_id automatically from
-- the logged-in user's entry in public.user_roles.
-- ================================================================

CREATE OR REPLACE FUNCTION public.auto_set_hotel_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.hotel_id IS NULL THEN
        SELECT hotel_id INTO NEW.hotel_id
        FROM public.user_roles
        WHERE user_id = auth.uid()
        LIMIT 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── spa_facilities ──────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.spa_facilities;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.spa_facilities
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── spa_services ────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.spa_services;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.spa_services
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── spa_bookings ────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.spa_bookings;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.spa_bookings
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── events ──────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.events;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── restaurants ─────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.restaurants;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── shops ───────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.shops;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.shops
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── shop_categories ─────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.shop_categories;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.shop_categories
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── shop_products ───────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.shop_products;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.shop_products
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── restaurant_menus ────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.restaurant_menus;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.restaurant_menus
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── request_categories ──────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.request_categories;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.request_categories
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── request_items ───────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.request_items;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.request_items
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── attractions ─────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.attractions;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.attractions
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── car_rentals ─────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.car_rentals;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.car_rentals
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── public_transport ────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.public_transport;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.public_transport
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── articles ────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.articles;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── guest_feedback ─────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.guest_feedback;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.guest_feedback
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── guests ─────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.guests;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.guests
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── rooms ──────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.rooms;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── table_reservations ────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.table_reservations;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.table_reservations
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── event_reservations ───────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.event_reservations;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.event_reservations
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── service_requests ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.service_requests;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.service_requests
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── messages ───────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.messages;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── conversations ─────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.conversations;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── stories ────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.stories;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.stories
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── hotel_about ────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.hotel_about;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.hotel_about
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();

-- ── hotel_config ───────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.hotel_config;
CREATE TRIGGER trg_auto_hotel_id
    BEFORE INSERT ON public.hotel_config
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();



