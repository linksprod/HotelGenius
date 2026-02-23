-- RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR

-- 1. Create a Default Hotel (Demo Hotel)
INSERT INTO public.hotels (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000000', 'Stay Genius Demo', 'demo')
ON CONFLICT (slug) DO NOTHING;

-- 2. Grant Yourself Super Admin Access
-- IMPORTANT: Replace 'YOUR-USER-UUID-HERE' with your actual User ID found in Supabase Dashboard > Authentication
-- This assumes you already have a user_role entry. If not, use the INSERT statement below.

UPDATE public.user_roles
SET role = 'super_admin',
    hotel_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id = 'YOUR-USER-UUID-HERE';  -- <--- CHANGE THIS

-- If the above update affected 0 rows (meaning you don't have a role set yet), run this instead:
/*
INSERT INTO public.user_roles (user_id, role, hotel_id)
VALUES ('YOUR-USER-UUID-HERE', 'super_admin', '00000000-0000-0000-0000-000000000000');
*/
