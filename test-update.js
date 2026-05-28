import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('hotels').update({ active_modules: ['restaurants', 'spa'] }).eq('slug', 'hotel-test').select();
  console.log("Update Data:", data);
  console.log("Update Error:", error);
}
run();
