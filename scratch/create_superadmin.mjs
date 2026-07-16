import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createSuperAdmin() {
  const email = "emna.jmal@gmail.com";
  
  // 1. Find the user ID in auth users
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error("Error listing users:", authErr);
    return;
  }
  
  let user = authData.users.find(u => u.email === email);
  
  if (!user) {
    console.log(`User ${email} not found in auth. Creating user...`);
    const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
      email: email,
      password: 'Password123!',
      email_confirm: true
    });
    if (createErr) {
      console.error("Error creating auth user:", createErr);
      return;
    }
    user = createData.user;
    console.log("Auth user created successfully with ID:", user.id);
  } else {
    console.log(`User found with ID: ${user.id}. Resetting password to Password123!...`);
    const { error: resetErr } = await supabase.auth.admin.updateUserById(user.id, {
      password: 'Password123!'
    });
    if (resetErr) console.error("Error resetting password:", resetErr);
  }

  // 2. Insert or update the role in public.user_roles to super_admin
  const { data: roleData, error: roleQueryErr } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleQueryErr) {
    console.error("Error querying user roles:", roleQueryErr);
    return;
  }

  if (roleData) {
    console.log("Updating existing user role to super_admin...");
    const { error: updateErr } = await supabase
      .from('user_roles')
      .update({ role: 'super_admin', hotel_id: null })
      .eq('user_id', user.id);
    if (updateErr) console.error("Error updating role:", updateErr);
    else console.log("Role successfully set to super_admin!");
  } else {
    console.log("Creating user_roles entry with super_admin role...");
    const { error: insertErr } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'super_admin', hotel_id: null });
    if (insertErr) console.error("Error inserting role:", insertErr);
    else console.log("Role successfully inserted as super_admin!");
  }
}

createSuperAdmin();
