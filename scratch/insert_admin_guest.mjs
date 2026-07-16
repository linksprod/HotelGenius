import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function insertAdminGuest() {
  const userId = '71db13c0-4591-49ca-b603-36b275bcabe9'; // zahra@admin.com
  const guestData = {
    user_id: userId,
    first_name: 'Molka',
    last_name: 'Admin',
    email: 'zahra@admin.com',
    guest_type: 'Standard Guest',
    hotel_id: '46011ae9-6b26-46fd-bd1b-49bf6e7a9714' // Zahra Hotel ID
  };

  const { data, error } = await supabase
    .from('guests')
    .upsert(guestData, { onConflict: 'user_id' });

  console.log("Upsert result:", data, error);
}

insertAdminGuest();
