-- Enable public read access for hotel_config
CREATE POLICY "Enable read access for all users on hotel_config" ON public.hotel_config
    FOR SELECT
    USING (true);

-- Enable RLS just in case it wasn't
ALTER TABLE public.hotel_config ENABLE ROW LEVEL SECURITY;
