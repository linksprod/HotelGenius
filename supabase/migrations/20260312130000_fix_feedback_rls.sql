
-- ================================================================
-- FIX: Feedback submission for guests (RPC version)
-- 
-- Why: 
--   PostgREST (the Supabase API layer) uses a schema cache that 
--   often fails to recognize newly added columns like 'hotel_id' 
--   or 'guest_id' immediately. Direct inserts fail with 
--   "Could not find column... in schema cache".
-- 
-- Solution: 
--   Use a Stored Procedure (RPC). The database engine always 
--   recognizes its own columns, regardless of the API cache state.
-- ================================================================

-- 1. Ensure columns exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'guest_feedback' AND column_name = 'guest_id'
    ) THEN
        ALTER TABLE public.guest_feedback ADD COLUMN guest_id UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'guest_feedback' AND column_name = 'hotel_id'
    ) THEN
        ALTER TABLE public.guest_feedback ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
    END IF;
END $$;

-- 2. Create the RPC function
CREATE OR REPLACE FUNCTION public.submit_guest_feedback(
    p_guest_name TEXT,
    p_guest_email TEXT,
    p_rating INTEGER,
    p_comment TEXT DEFAULT NULL,
    p_hotel_id UUID DEFAULT NULL,
    p_guest_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Essential to bypass RLS during the insert itself
SET search_path = public
AS $$
DECLARE
    v_new_id UUID;
    v_resolved_hotel_id UUID := p_hotel_id;
BEGIN
    -- Validation
    IF p_guest_name IS NULL OR p_guest_email IS NULL OR p_rating IS NULL THEN
        RAISE EXCEPTION 'Missing required fields: name, email, and rating are required.';
    END IF;

    -- Resolve hotel_id if not provided
    IF v_resolved_hotel_id IS NULL THEN
        -- Try provider guest_id
        IF p_guest_id IS NOT NULL THEN
            SELECT hotel_id INTO v_resolved_hotel_id FROM public.guests WHERE user_id = p_guest_id LIMIT 1;
        END IF;
        
        -- Try currently authenticated user
        IF v_resolved_hotel_id IS NULL AND auth.uid() IS NOT NULL THEN
            SELECT hotel_id INTO v_resolved_hotel_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
            
            IF v_resolved_hotel_id IS NULL THEN
                SELECT hotel_id INTO v_resolved_hotel_id FROM public.guests WHERE user_id = auth.uid() LIMIT 1;
            END IF;
        END IF;
    END IF;

    -- Final check
    IF v_resolved_hotel_id IS NULL THEN
        RAISE EXCEPTION 'Could not resolve hotel identification. Please provide a hotel_id or ensure the guest is correctly identified.';
    END IF;

    -- Perform the insert
    INSERT INTO public.guest_feedback (
        guest_name,
        guest_email,
        rating,
        comment,
        hotel_id,
        guest_id
    ) VALUES (
        p_guest_name,
        p_guest_email,
        p_rating,
        p_comment,
        v_resolved_hotel_id,
        COALESCE(p_guest_id, auth.uid())
    )
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
        'status', 'success',
        'id', v_new_id,
        'message', 'Feedback submitted successfully'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'message', SQLERRM
    );
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.submit_guest_feedback(TEXT, TEXT, INTEGER, TEXT, UUID, UUID) TO anon, authenticated;

-- 4. Maintain existing RLS for SELECT (for admins)
ALTER TABLE public.guest_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view feedback" ON public.guest_feedback;
CREATE POLICY "Admins can view feedback"
ON public.guest_feedback FOR SELECT
USING (public.can_access_hotel_data(hotel_id));

DROP POLICY IF EXISTS "Guests can view own feedback" ON public.guest_feedback;
CREATE POLICY "Guests can view own feedback"
ON public.guest_feedback FOR SELECT
USING (guest_id = auth.uid());
