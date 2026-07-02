-- Fix the can_access_hotel_data function to handle users with multiple roles (such as a default 'user' role + 'hotel_admin' role)
-- Historically, the 'LIMIT 1' would grab whichever role was returned first, which could be the basic 'user' role, resulting in false RLS denials.

CREATE OR REPLACE FUNCTION public.can_access_hotel_data(row_hotel_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- If the user is a super admin in any of their roles, allow access
    IF EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    ) THEN
        RETURN TRUE;
    END IF;

    -- If the user has a matching hotel role, allow access
    IF EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
          AND ur.hotel_id IS NOT NULL 
          AND (row_hotel_id IS NULL OR ur.hotel_id = row_hotel_id)
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
