-- Create hotels table
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    logo_url TEXT,
    primary_color TEXT
);

-- Add super_admin to app_role enum
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

-- Add hotel_id to user_roles
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES public.hotels(id);

-- Enable RLS
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Hotels
CREATE POLICY "Super Admins can do everything on hotels"
ON public.hotels
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'super_admin'
    )
);

CREATE POLICY "Hotel Admins can view and update their own hotel"
ON public.hotels
FOR ALL
USING (
    id IN (
        SELECT hotel_id FROM public.user_roles
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Public can view hotels by slug"
ON public.hotels
FOR SELECT
USING (true); -- Public needs to see hotel info to load the landing page/guest app

-- Update user_roles RLS to allow Super Admins to manage roles
CREATE POLICY "Super Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'super_admin'
    )
);

-- Helper function to get current user's hotel_id
CREATE OR REPLACE FUNCTION public.get_user_hotel_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT hotel_id 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
