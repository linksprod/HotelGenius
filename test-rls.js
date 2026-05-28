import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
async function run() {
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'test@hotelgenius.app',
    password: 'Password123!'
  });
  if (authErr) { console.log("Auth Error:", authErr); return; }
  
  // Try to read
  const { data: readData, error: readErr } = await supabase.from('hotels').select('*').eq('slug', 'hotel-test');
  console.log("RLS Read Data:", readData, readErr);
  
  // Try to update
  const { data: updateData, error: updateErr } = await supabase.from('hotels').update({ active_modules: [] }).eq('slug', 'hotel-test').select();
  console.log("RLS Update Data:", updateData, updateErr);
}
run();
