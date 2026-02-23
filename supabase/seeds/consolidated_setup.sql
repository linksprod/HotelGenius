-- RUN THIS ENTIRE SCRIPT IN YOUR SUPABASE SQL EDITOR
-- Updated to include 'address' to fix the Not-Null constraint error.

-- 1. Create 'hotels' table if it doesn't exist (This might be skipped if table exists)
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    logo_url TEXT,
    primary_color TEXT,
    address TEXT NOT NULL DEFAULT '123 Demo St' -- Added to match your existing schema
);

-- 2. Add 'slug' column if it's missing (safely)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'slug') THEN
        ALTER TABLE public.hotels ADD COLUMN slug TEXT NOT NULL DEFAULT 'temp-slug';
        ALTER TABLE public.hotels ADD CONSTRAINT hotels_slug_key UNIQUE (slug);
        ALTER TABLE public.hotels ALTER COLUMN slug DROP DEFAULT;
    END IF;
    
    -- Also ensure address column exists if we need it, though your error suggests it does
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'address') THEN
         ALTER TABLE public.hotels ADD COLUMN address TEXT DEFAULT '123 Demo St';
    END IF;
END $$;

-- 3. Add super_admin role to enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid  
                   WHERE t.typname = 'app_role' AND e.enumlabel = 'super_admin') THEN
        ALTER TYPE public.app_role ADD VALUE 'super_admin';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid  
                   WHERE t.typname = 'app_role' AND e.enumlabel = 'hotel_admin') THEN
        ALTER TYPE public.app_role ADD VALUE 'hotel_admin';
    END IF;
END$$;

-- 4. Add hotel_id to user_roles
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES public.hotels(id);

-- 5. Enable Security
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- 6. Insert Demo Hotel (Now with address)
INSERT INTO public.hotels (id, name, slug, address)
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    'Stay Genius Demo', 
    'demo',
    '123 Demo St, Tech City'
)
ON CONFLICT (slug) DO UPDATE 
SET address = EXCLUDED.address; -- Update address if it exists to be safe

-- 7. Grant Yourself Super Admin Access
-- REPLACE 'YOUR-USER-UUID-HERE' with your actual User ID
UPDATE public.user_roles
SET role = 'super_admin',
    hotel_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id = 'YOUR-USER-UUID-HERE';
