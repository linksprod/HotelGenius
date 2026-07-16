import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function findSuperAdmin() {
  // 1. Fetch user roles that are super_admin
  const { data: roles, error: roleErr } = await supabase
    .from('user_roles')
    .select('user_id, role, hotel_id')
    .eq('role', 'super_admin');
    
  if (roleErr) {
    console.error("Error fetching roles:", roleErr);
    return;
  }
  
  console.log("Super Admin roles in DB:", roles);
  
  // 2. Fetch auth users
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error("Error listing users:", authErr);
    return;
  }
  
  const superAdminIds = new Set(roles.map(r => r.user_id));
  const superAdminUsers = authData.users.filter(u => superAdminIds.has(u.id));
  
  console.log("\nMatching Auth Users for Super Admin:");
  superAdminUsers.forEach(u => {
    console.log(`- Email: ${u.email} (ID: ${u.id})`);
  });
  
  if (superAdminUsers.length === 0) {
    console.log("No auth users matched super_admin IDs. Listing all auth users:");
    authData.users.forEach(u => {
      console.log(`- Email: ${u.email} (ID: ${u.id})`);
    });
  } else {
    // Reset the first super admin's password to a known value to help the user login
    const targetUser = superAdminUsers[0];
    const { error: resetErr } = await supabase.auth.admin.updateUserById(targetUser.id, {
      password: 'Password123!'
    });
    if (resetErr) {
      console.error("Failed to reset password:", resetErr);
    } else {
      console.log(`\nPassword for ${targetUser.email} has been reset to: Password123!`);
    }
  }
}

findSuperAdmin();
