-- Migration to add hotel_id to all relevant tables for multi-tenancy

-- Helper function to add hotel_id if not exists
CREATE OR REPLACE FUNCTION add_hotel_id_column(table_name text) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = 'hotel_id'
    ) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN hotel_id UUID REFERENCES public.hotels(id)', $1);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add hotel_id to features
SELECT add_hotel_id_column('guests');
SELECT add_hotel_id_column('rooms');
SELECT add_hotel_id_column('table_reservations');
SELECT add_hotel_id_column('spa_bookings');
SELECT add_hotel_id_column('event_reservations');
SELECT add_hotel_id_column('service_requests');
SELECT add_hotel_id_column('messages');
SELECT add_hotel_id_column('conversations');
SELECT add_hotel_id_column('events');
SELECT add_hotel_id_column('restaurants');
SELECT add_hotel_id_column('spa_facilities');
SELECT add_hotel_id_column('shops');
SELECT add_hotel_id_column('attractions');
SELECT add_hotel_id_column('car_rentals');
SELECT add_hotel_id_column('public_transport');
SELECT add_hotel_id_column('articles');
SELECT add_hotel_id_column('guest_feedback');

-- Clean up helper
DROP FUNCTION add_hotel_id_column(table_name);

-- Create a Default/Fallback Hotel for existing data if needed
-- (Optional: You might want to assign existing data to the demo hotel)
DO $$
DECLARE
    demo_hotel_id UUID;
BEGIN
    SELECT id INTO demo_hotel_id FROM public.hotels WHERE slug = 'demo' LIMIT 1;
    
    IF demo_hotel_id IS NOT NULL THEN
        -- Update existing records to belong to the demo hotel
        UPDATE public.guests SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.rooms SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.table_reservations SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.spa_bookings SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.event_reservations SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.service_requests SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.messages SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.conversations SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.events SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.restaurants SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.spa_facilities SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.shops SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.attractions SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.car_rentals SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.public_transport SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.articles SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.guest_feedback SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
    END IF;
END $$;

-- Enable RLS on all these tables if not already enabled
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spa_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spa_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_feedback ENABLE ROW LEVEL SECURITY;

-- Create Policy Function for Hotel Access
CREATE OR REPLACE FUNCTION public.can_access_hotel_data(row_hotel_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_hotel_id UUID;
    user_role public.app_role;
BEGIN
    -- Get current user's role and hotel_id
    SELECT role, hotel_id INTO user_role, user_hotel_id
    FROM public.user_roles
    WHERE user_id = auth.uid();

    -- Super Admin can see everything
    IF user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;

    -- Hotel Admin/Staff can only see their own hotel's data
    IF user_hotel_id IS NOT NULL AND user_hotel_id = row_hotel_id THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Policies (Example for guests, repeat for others)
-- We need to drop existing policies first to be safe or use CREATE OR REPLACE logic if supported (Policies generally need DROP IF EXISTS)

-- Helper to quickly create simple tenant isolation policy
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'guests', 'rooms', 'table_reservations', 'spa_bookings', 'event_reservations',
        'service_requests', 'messages', 'conversations', 'events', 'restaurants',
        'spa_facilities', 'shops', 'attractions', 'car_rentals', 'public_transport', 'articles', 'guest_feedback'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Drop existing generic policies if they conflict (optional, depends on your strategy)
        -- EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation" ON public.%I', t);
        
        -- Create new policy
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
