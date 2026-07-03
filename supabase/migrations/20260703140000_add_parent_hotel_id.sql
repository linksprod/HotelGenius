-- Add parent_hotel_id to support chains and sub-hotels/establishments
ALTER TABLE public.hotels
ADD COLUMN IF NOT EXISTS parent_hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL;

-- Add languages column to hotels table (required by provision-hotel function)
ALTER TABLE public.hotels
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['en'];
