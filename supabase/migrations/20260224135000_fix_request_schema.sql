-- Migration to fix missing hotel_id columns in request tables
-- and enable RLS policies for multi-tenancy.

-- 1. Add hotel_id columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'request_categories' AND column_name = 'hotel_id') THEN
        ALTER TABLE public.request_categories ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'request_items' AND column_name = 'hotel_id') THEN
        ALTER TABLE public.request_items ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
    END IF;
END $$;

-- 2. Populate hotel_id for existing records (fallback to demo hotel)
DO $$
DECLARE
    demo_hotel_id UUID;
BEGIN
    SELECT id INTO demo_hotel_id FROM public.hotels WHERE slug = 'demo' LIMIT 1;
    
    IF demo_hotel_id IS NOT NULL THEN
        UPDATE public.request_categories SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.request_items SET hotel_id = demo_hotel_id WHERE hotel_id IS NULL;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.request_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;

-- 4. Re-create or Ensure Policies
-- (Reuse the can_access_hotel_data function defined in earlier migrations)

DO $$
DECLARE
    t text;
    tables text[] := ARRAY['request_categories', 'request_items'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
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
