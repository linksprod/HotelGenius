import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === 'test@hotelgenius.app');
  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, { password: 'Password123!' });
    console.log("Password reset:", error ? error : "Success");
  }
}
run();
