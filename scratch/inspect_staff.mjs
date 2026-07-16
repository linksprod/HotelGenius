import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  console.log("Fetching user_roles...");
  const { data: roles } = await supabase.from('user_roles').select('*');
  console.log("All user roles:", roles);

  const { data: guests } = await supabase.from('guests').select('*');
  console.log("All guests in DB:", guests.map(g => ({
    id: g.id,
    user_id: g.user_id,
    email: g.email,
    first_name: g.first_name,
    last_name: g.last_name,
    hotel_id: g.hotel_id
  })));

  // Let's also check auth users
  const { data: { users } } = await supabase.auth.admin.listUsers();
  console.log("All Auth Users:", users.map(u => ({
    id: u.id,
    email: u.email,
    user_metadata: u.user_metadata
  })));
}

inspect();
