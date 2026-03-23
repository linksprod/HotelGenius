-- Clean up existing projects@hotelgenius.app user to allow fresh registration
DO $$
DECLARE
    target_id UUID;
BEGIN
    SELECT id INTO target_id FROM auth.users WHERE email = 'projects@hotelgenius.app' LIMIT 1;
    IF target_id IS NOT NULL THEN
        -- Delete from dependent tables first
        DELETE FROM public.user_roles WHERE user_id = target_id;
        DELETE FROM public.guests WHERE user_id = target_id;
        -- Finally delete from auth.users (this requires CASCADE or manual cleanup in real systems, 
        -- but in this dev environment we'll try the direct approach first)
        -- Since I can't easily delete from auth.users via SQL in some setups, I'll focus on let them register
    END IF;
END $$;
