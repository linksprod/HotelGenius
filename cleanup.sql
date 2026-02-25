
-- Cleanup request categories for the demo hotel (slug 'demo')
DO $$
DECLARE
    demo_hotel_id UUID;
BEGIN
    SELECT id INTO demo_hotel_id FROM hotels WHERE slug = 'demo';
    
    IF demo_hotel_id IS NOT NULL THEN
        DELETE FROM request_items WHERE hotel_id = demo_hotel_id;
        DELETE FROM request_categories WHERE hotel_id = demo_hotel_id;
        RAISE NOTICE 'Cleaned up categories and items for demo hotel (ID: %)', demo_hotel_id;
    ELSE
        RAISE NOTICE 'Demo hotel not found';
    END IF;
END $$;
