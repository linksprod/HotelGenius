import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === 'test@hotelgenius.app');
  if (!user) {
    console.log("User not found!");
    return;
  }
  const { data: roles } = await supabase.from('user_roles').select('*').eq('user_id', user.id);
  console.log("Roles for user:", roles);
}
run();
