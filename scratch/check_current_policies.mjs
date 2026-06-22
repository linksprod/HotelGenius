import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const sql = `
    SELECT policyname, cmd, definition 
    FROM pg_policies 
    WHERE tablename = 'notifications';
  `;

  console.log("Fetching notifications RLS policies...");
  const { data, error } = await supabase.rpc('run_sql', { sql });

  if (error) {
    console.error("Failed to query policies:", error.message);
  } else {
    console.log("NOTIFICATIONS POLICIES:");
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
