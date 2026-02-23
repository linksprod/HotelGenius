-- PART 2: DATA SEEDING
-- RUN THIS SCRIPT SECOND (After Part 1 is successful)

-- 1. Insert Demo Hotel
INSERT INTO public.hotels (id, name, slug, address)
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    'Stay Genius Demo', 
    'demo',
    '123 Demo St, Tech City'
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Grant Yourself Super Admin Access
-- REPLACE 'YOUR-USER-UUID-HERE' with your actual User ID
UPDATE public.user_roles
SET role = 'super_admin',
    hotel_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id = 'YOUR-USER-UUID-HERE';
