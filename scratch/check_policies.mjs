import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL="(.*)"/)[1];
const key = envFile.match(/VITE_SUPABASE_SERVICE_ROLE_KEY="(.*)"/)[1];
const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { query: "SELECT * FROM pg_policies WHERE tablename = 'hotel_config';" });
  if (error) console.error("No exec_sql function found.", error.message);
  else console.dir(data, { depth: null });
}
run();
