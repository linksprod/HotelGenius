import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL="(.*)"/)[1];
const key = envFile.match(/VITE_SUPABASE_SERVICE_ROLE_KEY="(.*)"/)[1];
const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.from('hotel_config').select('*');
  console.log(data ? data.length : 'no data', error);
}
run();
