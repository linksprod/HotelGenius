import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL="(.*)"/)[1];
const key = envFile.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*)"/)[1];
const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.from('hotel_config').select('id, hotel_id, home_hero_title, home_hero_subtitle, home_hero_image, featured_experiences');
  console.dir(data, { depth: null });
}
run();
