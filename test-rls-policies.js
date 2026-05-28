import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.rpc('get_policies_helper', {}).catch(e => ({}));
  // let's just query pg_policies
  const res = await supabase.from('pg_policies').select('*').eq('tablename', 'hotels').catch(e => ({}));
  console.log("Policies:", res?.data || "failed");
}
run();
