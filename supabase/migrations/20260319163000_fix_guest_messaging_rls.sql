-- Fix can_access_hotel_data to allow guests to access their own hotel's data
-- even if they don't have a record in the staff-focused user_roles table.

CREATE OR REPLACE FUNCTION public.can_access_hotel_data(row_hotel_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_hotel_id UUID;
    user_role public.app_role;
BEGIN
    -- 1. Check user_roles (Staff/Admin)
    SELECT role, hotel_id INTO user_role, user_hotel_id
    FROM public.user_roles
    WHERE user_id = auth.uid();

    -- Super Admin can see everything
    IF user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;

    -- Staff/Admin can only see their own hotel's data
    IF user_hotel_id IS NOT NULL AND user_hotel_id = row_hotel_id THEN
        RETURN TRUE;
    END IF;

    -- 2. Check guests table (Guest)
    -- If they don't have a staff role, check if they are a guest at this hotel
    IF user_role IS NULL THEN
        SELECT hotel_id INTO user_hotel_id
        FROM public.guests
        WHERE user_id = auth.uid()
        LIMIT 1;

        IF user_hotel_id IS NOT NULL AND user_hotel_id = row_hotel_id THEN
            RETURN TRUE;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply policies to specifically allow NULL hotel_id on messages/conversations 
-- if they are being created (some logs/system messages might not have it yet)
-- But for our current app, hotel_id should be present.

-- Ensure guest can insert messages if they own the conversation
DROP POLICY IF EXISTS "Tenant Isolation Insert" ON public.messages;
CREATE POLICY "Tenant Isolation Insert" ON public.messages
FOR INSERT
WITH CHECK (
  public.can_access_hotel_data(hotel_id) OR 
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id 
    AND guest_id = auth.uid()
  )
);
