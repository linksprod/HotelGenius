-- Step 1: Add hotel_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'request_categories' AND column_name = 'hotel_id'
    ) THEN
        ALTER TABLE public.request_categories ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'request_items' AND column_name = 'hotel_id'
    ) THEN
        ALTER TABLE public.request_items ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
    END IF;
END $$;

-- Step 2: Populate hotel_id for any existing records without one (assign to 'fiesta' hotel)
DO $$
DECLARE
    v_hotel_id UUID;
BEGIN
    SELECT id INTO v_hotel_id FROM public.hotels WHERE slug = 'fiesta' LIMIT 1;
    IF v_hotel_id IS NOT NULL THEN
        UPDATE public.request_categories SET hotel_id = v_hotel_id WHERE hotel_id IS NULL;
        UPDATE public.request_items SET hotel_id = v_hotel_id WHERE hotel_id IS NULL;
    END IF;
END $$;

-- Step 3: Enable RLS
ALTER TABLE public.request_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;

-- Step 4: Improve the can_access_hotel_data function
CREATE OR REPLACE FUNCTION public.can_access_hotel_data(row_hotel_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_hotel_id UUID;
    user_role TEXT;
BEGIN
    SELECT ur.role::TEXT, ur.hotel_id INTO user_role, user_hotel_id
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    LIMIT 1;

    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;

    IF user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;

    -- Hotel Admin/Staff can access their own hotel's data
    -- Also allow NULL row_hotel_id (backward compatibility / new inserts)
    IF user_hotel_id IS NOT NULL AND (row_hotel_id IS NULL OR user_hotel_id = row_hotel_id) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Re-create RLS policies for request_categories and request_items
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
