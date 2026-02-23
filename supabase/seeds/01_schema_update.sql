-- PART 1: SCHEMA UPDATES
-- RUN THIS SCRIPT FIRST IN SUPABASE SQL EDITOR

-- 1. Create 'hotels' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    logo_url TEXT,
    primary_color TEXT,
    address TEXT NOT NULL DEFAULT '123 Demo St'
);

-- 2. Add 'slug' and 'address' columns if they are missing (Safe Update)
DO $$
BEGIN
    -- Check for slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'slug') THEN
        ALTER TABLE public.hotels ADD COLUMN slug TEXT NOT NULL DEFAULT 'temp-slug';
        ALTER TABLE public.hotels ADD CONSTRAINT hotels_slug_key UNIQUE (slug);
        ALTER TABLE public.hotels ALTER COLUMN slug DROP DEFAULT;
    END IF;
    
    -- Check for address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'address') THEN
         ALTER TABLE public.hotels ADD COLUMN address TEXT NOT NULL DEFAULT '123 Demo St';
    END IF;
END $$;

-- 3. Add super_admin role to enum (Must be committed before use)
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
