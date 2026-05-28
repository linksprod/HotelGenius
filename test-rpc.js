import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
async function run() {
  const { data, error } = await supabase.rpc('get_hotel_by_slug', { p_slug: 'hotel-test' });
  console.log("RPC Data:", data);
  console.log("RPC Error:", error);
}
run();
