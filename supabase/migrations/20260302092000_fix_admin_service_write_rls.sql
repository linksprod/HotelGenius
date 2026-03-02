-- Fix admin write permissions for service categories and items
-- The can_access_hotel_data() function is overly restrictive for inserts,
-- causing hotel admins to fail when creating/seeding categories.

-- Improved version that handles NULL hotel_id gracefully and ensures
-- hotel admins can always write to their own hotel's data.

CREATE OR REPLACE FUNCTION public.can_access_hotel_data(row_hotel_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_hotel_id UUID;
    user_role TEXT;
BEGIN
    -- Get current user's role and hotel_id from user_roles
    SELECT ur.role::TEXT, ur.hotel_id INTO user_role, user_hotel_id
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    LIMIT 1;

    -- If no role found, deny access
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Super Admin can access everything
    IF user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;

    -- Hotel Admin/Staff can access their own hotel's data
    -- Also allow access when row_hotel_id is NULL (backward compatibility)
    IF user_hotel_id IS NOT NULL AND (row_hotel_id IS NULL OR user_hotel_id = row_hotel_id) THEN
        RETURN TRUE;
    END IF;

    -- Guests can access hotel data matching the hotel they belong to
    -- (handled by guest-specific policies on the guests table)
    IF user_role = 'guest' AND user_hotel_id IS NOT NULL AND user_hotel_id = row_hotel_id THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply INSERT policies specifically to allow hotel admins to insert
-- without being blocked by the WITH CHECK constraint race condition

DO $$
DECLARE
    t text;
    tables text[] := ARRAY['request_categories', 'request_items'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Insert" ON public.%I', t);
        
        -- Allow hotel admins to insert their own hotel's data
        -- The WITH CHECK uses the helper function which now handles nulls gracefully
        EXECUTE format('
            CREATE POLICY "Tenant Isolation Insert" ON public.%I
            FOR INSERT
            WITH CHECK (public.can_access_hotel_data(hotel_id));
        ', t);
    END LOOP;
END $$;
