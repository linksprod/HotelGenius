
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("--- Hotels ---");
    const { data: hotels } = await supabase.from('hotels').select('id, name, slug');
    console.table(hotels);

    console.log("\n--- Request Categories ---");
    const { data: categories } = await supabase.from('request_categories').select('id, name, hotel_id');
    console.table(categories);

    console.log("\n--- My Current User (if any) ---");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: roles } = await supabase.from('user_roles').select('*').eq('user_id', user.id);
        console.log("User roles:", roles);
    } else {
        console.log("No user session found via service role / environment key (expected if using anon key)");
    }
}

debug();
