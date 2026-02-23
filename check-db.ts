
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTE4NTgsImV4cCI6MjA1NTYyNzg1OH0.Ce053YUmDJ2lFS1f6_BRsOUsEezstxUmVZ1tanXPeC4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkSingle(table) {
    const { error } = await supabase.from(table).select('hotel_id').limit(1);
    if (error) {
        console.log(`${table}:${error.message}`);
    } else {
        console.log(`${table}:OK`);
    }
}

async function run() {
    await checkSingle('shop_categories');
    await checkSingle('shop_products');
}
run();
