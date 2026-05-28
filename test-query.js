import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
async function run() {
  const { data, error } = await supabase.from('hotels').select('*').limit(1);
  console.log("Hotels:", data ? Object.keys(data[0] || {}) : data, "Error:", error);
}
run();
