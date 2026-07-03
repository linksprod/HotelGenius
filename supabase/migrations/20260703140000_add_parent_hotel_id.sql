-- Add parent_hotel_id to support chains and sub-hotels/establishments
ALTER TABLE public.hotels
ADD COLUMN IF NOT EXISTS parent_hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL;
