import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: roles } = await supabase.from('user_roles').select('*');
  console.log("Roles in DB:", roles);
  
  const { data: guests } = await supabase.from('guests').select('*');
  
  for (const role of roles) {
    const matchingGuest = guests.find(g => g.user_id === role.user_id);
    console.log(`User ID: ${role.user_id}, Role: ${role.role}, Has Guest Profile?: ${!!matchingGuest}`);
    if (matchingGuest) {
      console.log(`  -> Guest: ${matchingGuest.first_name} ${matchingGuest.last_name} (${matchingGuest.email})`);
    }
  }
}

check();
