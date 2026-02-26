-- Seed service categories and items for the 'fiesta' hotel
-- This migration finds the hotel ID by its slug 'fiesta'

DO $$
DECLARE
    v_hotel_id UUID;
    housekeeping_id UUID := gen_random_uuid();
    security_id UUID := gen_random_uuid();
    maintenance_id UUID := gen_random_uuid();
    it_id UUID := gen_random_uuid();
BEGIN
    -- 0. Get the hotel ID for slug 'fiesta'
    SELECT id INTO v_hotel_id FROM public.hotels WHERE slug = 'fiesta';

    IF v_hotel_id IS NULL THEN
        RAISE NOTICE 'Hotel with slug "fiesta" not found. Skipping seeding.';
        RETURN;
    END IF;

    -- 1. Insert Categories
    -- Housekeeping
    INSERT INTO public.request_categories (id, hotel_id, name, description, icon, is_active)
    VALUES (housekeeping_id, v_hotel_id, 'Housekeeping', 'Room cleaning and amenities', 'Trash2', true)
    ON CONFLICT (hotel_id, name) DO UPDATE SET is_active = true RETURNING id INTO housekeeping_id;

    -- Security
    INSERT INTO public.request_categories (id, hotel_id, name, description, icon, is_active)
    VALUES (security_id, v_hotel_id, 'Security', 'Safety and security services', 'Shield', true)
    ON CONFLICT (hotel_id, name) DO UPDATE SET is_active = true RETURNING id INTO security_id;

    -- Maintenance
    INSERT INTO public.request_categories (id, hotel_id, name, description, icon, is_active)
    VALUES (maintenance_id, v_hotel_id, 'Maintenance', 'Repairs and technical support', 'Wrench', true)
    ON CONFLICT (hotel_id, name) DO UPDATE SET is_active = true RETURNING id INTO maintenance_id;

    -- IT Support
    INSERT INTO public.request_categories (id, hotel_id, name, description, icon, is_active)
    VALUES (it_id, v_hotel_id, 'Information Technology', 'Wi-Fi and electronic help', 'Laptop', true)
    ON CONFLICT (hotel_id, name) DO UPDATE SET is_active = true RETURNING id INTO it_id;

    -- 2. Insert Items for Housekeeping
    INSERT INTO public.request_items (hotel_id, category_id, name, description, is_active)
    VALUES 
        (v_hotel_id, housekeeping_id, 'Towels', 'Extra towels request', true),
        (v_hotel_id, housekeeping_id, 'Room Cleaning', 'Daily room cleaning', true),
        (v_hotel_id, housekeeping_id, 'Mini-bar Refill', 'Refill mini-bar items', true),
        (v_hotel_id, housekeeping_id, 'Extra Pillow', 'Additional pillows', true)
    ON CONFLICT DO NOTHING;

    -- 3. Insert Items for Security
    INSERT INTO public.request_items (hotel_id, category_id, name, description, is_active)
    VALUES 
        (v_hotel_id, security_id, 'CCTV camera', 'CCTV request', true),
        (v_hotel_id, security_id, 'Lost and found assistance', 'Lost and found', true),
        (v_hotel_id, security_id, 'Report noise, security concerns', 'Noise/ security', true),
        (v_hotel_id, security_id, 'Safe blocked', 'Safe deposit blocked', true),
        (v_hotel_id, security_id, 'Safe deposit request', 'Safe deposit', true)
    ON CONFLICT DO NOTHING;

    -- 4. Insert Items for Maintenance
    INSERT INTO public.request_items (hotel_id, category_id, name, description, is_active)
    VALUES 
        (v_hotel_id, maintenance_id, 'AC repair', 'Air conditioning issue', true),
        (v_hotel_id, maintenance_id, 'Light bulb replacement', 'Burned out bulb', true),
        (v_hotel_id, maintenance_id, 'Plumbing issue', 'Leak or clog', true)
    ON CONFLICT DO NOTHING;

    -- 5. Insert Items for IT
    INSERT INTO public.request_items (hotel_id, category_id, name, description, is_active)
    VALUES 
        (v_hotel_id, it_id, 'Guest Wi-Fi help', 'Connection issues', true),
        (v_hotel_id, it_id, 'TV Remote issue', 'Remote not working', true),
        (v_hotel_id, it_id, 'Phone system', 'Internal phone help', true)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seeded services for hotel "fiesta" (ID: %)', v_hotel_id;

END $$;
