-- Create hotel_activities table
CREATE TABLE IF NOT EXISTS public.hotel_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hotel_activities ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "Allow public read access to hotel_activities" ON public.hotel_activities;
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON public.hotel_activities;

CREATE POLICY "Allow public read access to hotel_activities" ON public.hotel_activities
  FOR SELECT USING (true);

CREATE POLICY "Allow all access to authenticated users" ON public.hotel_activities
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_hotel_activities_timestamp ON public.hotel_activities;
CREATE TRIGGER set_hotel_activities_timestamp
BEFORE UPDATE ON public.hotel_activities
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
