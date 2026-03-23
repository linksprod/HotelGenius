-- Targeted fix for service_requests table missing hotel_id column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'service_requests' 
        AND column_name = 'hotel_id'
    ) THEN
        ALTER TABLE public.service_requests ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
        
        -- Optional: Assign to demo hotel if it exists
        DECLARE
            demo_id UUID;
        BEGIN
            SELECT id INTO demo_id FROM public.hotels WHERE slug = 'demo' LIMIT 1;
            IF demo_id IS NOT NULL THEN
                UPDATE public.service_requests SET hotel_id = demo_id WHERE hotel_id IS NULL;
            END IF;
        END;
    END IF;
END $$;

-- Also check other tables that might be missing hotel_id based on previous errors
DO $$
DECLARE
    table_name_var text;
    tables_to_check text[] := ARRAY['guests', 'messages', 'conversations', 'events'];
BEGIN
    FOREACH table_name_var IN ARRAY tables_to_check LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_name_var 
            AND column_name = 'hotel_id'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN hotel_id UUID REFERENCES public.hotels(id)', table_name_var);
        END IF;
    END LOOP;
END $$;
