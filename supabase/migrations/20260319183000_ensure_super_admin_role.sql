-- Ensure projects@hotelgenius.app is a super_admin
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. Find the user ID by email
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'projects@hotelgenius.app' LIMIT 1;
    
    IF target_user_id IS NOT NULL THEN
        -- 2. Upsert the super_admin role for this user
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'super_admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Also ensure they have a record in the user_roles for any specific hotel if needed
        -- but for super_admin, the role alone is enough for global access.
        
        RAISE NOTICE 'User projects@hotelgenius.app (ID: %) is now a super_admin', target_user_id;
    ELSE
        RAISE NOTICE 'User projects@hotelgenius.app not found in auth.users';
    END IF;
END $$;
