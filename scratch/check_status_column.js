import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // 1. Check if status column already exists by selecting it
  console.log("Checking if 'status' column exists in hotels table...");
  const { data, error } = await supabase
    .from('hotels')
    .select('id, status')
    .limit(1);

  if (error) {
    if (error.message.includes('column') && error.message.includes('status')) {
      console.log("Column 'status' does NOT exist yet. Need to run migration.");
    } else {
      console.error("Unexpected error:", error);
    }
    return;
  }

  console.log("Column 'status' EXISTS! Data:", data);
  console.log("No migration needed for status column.");
}

main();
