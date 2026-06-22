import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTE4NTgsImV4cCI6MjA1NTYyNzg1OH0.Ce053YUmDJ2lFS1f6_BRsOUsEezstxUmVZ1tanXPeC4";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function run() {
  console.log("Fetching pending service requests with category name...");
  const { data, error } = await supabase
    .from('service_requests')
    .select('id, category_id, created_at, request_categories(name)')
    .limit(5);

  if (error) {
    console.error("Query failed:", error);
  } else {
    console.log("Query succeeded! Sample data:");
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
