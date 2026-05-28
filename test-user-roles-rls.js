import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
async function run() {
  await supabase.auth.signInWithPassword({ email: 'test@hotelgenius.app', password: 'Password123!' });
  const { data, error } = await supabase.from('user_roles').select('*');
  console.log("User Roles Read:", data, error);
}
run();
