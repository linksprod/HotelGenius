import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables');
  if (error) {
    // If get_tables RPC does not exist, let's query via SQL or metadata
    console.log("Error querying RPC:", error);
    // Let's run a generic query to see schema
    const { data: schemas, error: sErr } = await supabase
      .from('guests')
      .select('*')
      .limit(1);
    console.log("Guests columns:", schemas ? Object.keys(schemas[0] || {}) : null);
  } else {
    console.log("Tables in DB:", data);
  }
}

listTables();
