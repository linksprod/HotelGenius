import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Query pg_proc to find routines in public schema
  const { data, error } = await supabase
    .from('pg_catalog.pg_proc')
    .select('proname')
    .limit(10);
    
  if (error) {
    // If pg_catalog is restricted, let's try reading routines via standard sql or check if we can query pg_proc
    console.error("Error direct pg_proc:", error);
    
    // Let's try calling another view
    const { data: d2, error: e2 } = await supabase.from('information_schema.routines').select('routine_name').limit(10);
    console.error("Error information_schema:", e2 || d2);
    return;
  }
  
  console.log("pg_proc routines:", data);
}

main();
