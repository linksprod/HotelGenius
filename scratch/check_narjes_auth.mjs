import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkNarjes() {
  const email = 'narjeshotel@admin.com';
  
  // Find auth user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    console.log("No user found with email:", email);
    return;
  }
  
  console.log("User details:", { id: user.id, email: user.email });
  
  // Find user_roles
  const { data: roles } = await supabase.from('user_roles').select('*').eq('user_id', user.id);
  console.log("Roles for user:", roles);
  
  // Let's print the hotel details for those roles
  for (const r of roles) {
    if (r.hotel_id) {
      const { data: hotel } = await supabase.from('hotels').select('*').eq('id', r.hotel_id).maybeSingle();
      console.log(`  -> Role '${r.role}' is for hotel: ${hotel?.name} (slug: ${hotel?.slug}, id: ${hotel?.id})`);
    } else {
      console.log(`  -> Role '${r.role}' has hotel_id = null`);
    }
  }
}

checkNarjes();
