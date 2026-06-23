
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qvhthjtdzeerafabfbfc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.hotel_activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      time TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    ALTER TABLE public.hotel_activities ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow public read access to hotel_activities" ON public.hotel_activities;
    DROP POLICY IF EXISTS "Allow all access to authenticated users" ON public.hotel_activities;

    CREATE POLICY "Allow public read access to hotel_activities" ON public.hotel_activities
      FOR SELECT USING (true);

    CREATE POLICY "Allow all access to authenticated users" ON public.hotel_activities
      FOR ALL USING (auth.role() = 'authenticated');

    DROP TRIGGER IF EXISTS set_hotel_activities_timestamp ON public.hotel_activities;
    CREATE TRIGGER set_hotel_activities_timestamp
    BEFORE UPDATE ON public.hotel_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  `;

  console.log("Posting to exec_sql RPC...");
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('REST RPC failed:', response.status, text);
  } else {
    console.log('REST RPC succeeded! Table hotel_activities created.');
  }
}

run();

