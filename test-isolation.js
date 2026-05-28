import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const res = await supabase.from('pg_policies').select('*').eq('tablename', 'hotels');
  console.log("Policies:", res.data);
}
run();
