
-- Add hotel_id to child tables
ALTER TABLE public.restaurant_menus ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.shop_categories ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.spa_facilities ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.spa_services ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.spa_bookings ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES public.hotels(id);

-- Enable RLS
ALTER TABLE public.restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spa_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spa_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spa_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'restaurant_menus', 'shop_categories', 'shop_products', 
        'spa_facilities', 'spa_services', 'spa_bookings', 'events'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Drop existing policies if they exist to avoid errors on rerun
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Insert" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Update" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Delete" ON public.%I', t);

        -- Create new policies
        EXECUTE format('CREATE POLICY "Tenant Isolation Select" ON public.%I FOR SELECT USING (public.can_access_hotel_data(hotel_id));', t);
        EXECUTE format('CREATE POLICY "Tenant Isolation Insert" ON public.%I FOR INSERT WITH CHECK (public.can_access_hotel_data(hotel_id));', t);
        EXECUTE format('CREATE POLICY "Tenant Isolation Update" ON public.%I FOR UPDATE USING (public.can_access_hotel_data(hotel_id));', t);
        EXECUTE format('CREATE POLICY "Tenant Isolation Delete" ON public.%I FOR DELETE USING (public.can_access_hotel_data(hotel_id));', t);
    END LOOP;
END $$;
