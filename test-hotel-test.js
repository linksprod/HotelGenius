import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('hotels').select('active_modules').eq('slug', 'hotel-test').single();
  console.log("Hotel Test active_modules:", data, error);
}
run();
