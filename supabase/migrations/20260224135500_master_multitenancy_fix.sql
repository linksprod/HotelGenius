-- MASTER MULTI-TENANCY FIX
-- Adds missing hotel_id columns and ensures RLS policies are set up correctly

-- 1. Helper function to safely add columns
CREATE OR REPLACE FUNCTION public.safe_add_hotel_id(target_table text) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = target_table AND column_name = 'hotel_id'
    ) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN hotel_id UUID REFERENCES public.hotels(id)', target_table);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Apply to all missing/new tables
SELECT public.safe_add_hotel_id('request_categories');
SELECT public.safe_add_hotel_id('request_items');
SELECT public.safe_add_hotel_id('stories');
SELECT public.safe_add_hotel_id('hotel_about');
SELECT public.safe_add_hotel_id('hotel_config');
SELECT public.safe_add_hotel_id('restaurant_menus');
SELECT public.safe_add_hotel_id('shop_categories');
SELECT public.safe_add_hotel_id('shop_products');
SELECT public.safe_add_hotel_id('spa_services');

DROP FUNCTION public.safe_add_hotel_id(text);

-- 3. Populate existing records for 'demo' hotel
DO $$
DECLARE
    demo_hotel_id UUID;
BEGIN
    SELECT id INTO demo_hotel_id FROM public.hotels WHERE slug = 'demo' LIMIT 1;
    
    IF demo_hotel_id IS NOT NULL THEN
        UPDATE public.request_categories SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.request_items SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.stories SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.hotel_about SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.hotel_config SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.restaurant_menus SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.shop_categories SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.shop_products SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.spa_services SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
    END IF;
END $$;

-- 4. Enable RLS and apply policies
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'request_categories', 'request_items', 'stories', 'hotel_about', 'hotel_config',
        'restaurant_menus', 'shop_categories', 'shop_products', 'spa_services'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Insert" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Update" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Delete" ON public.%I', t);
        
        EXECUTE format('
            CREATE POLICY "Tenant Isolation Select" ON public.%I
            FOR SELECT
            USING (public.can_access_hotel_data(hotel_id));
        ', t);

        EXECUTE format('
            CREATE POLICY "Tenant Isolation Insert" ON public.%I
            FOR INSERT
            WITH CHECK (public.can_access_hotel_data(hotel_id));
        ', t);

        EXECUTE format('
            CREATE POLICY "Tenant Isolation Update" ON public.%I
            FOR UPDATE
            USING (public.can_access_hotel_data(hotel_id));
        ', t);

        EXECUTE format('
            CREATE POLICY "Tenant Isolation Delete" ON public.%I
            FOR DELETE
            USING (public.can_access_hotel_data(hotel_id));
        ', t);
    END LOOP;
END $$;
