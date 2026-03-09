
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBookings() {
    const { data, error } = await supabase
        .from('spa_bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching spa_bookings:', error);
    } else {
        console.log('Recent Spa Bookings:');
        console.log(JSON.stringify(data, null, 2));
    }

    const { data: notifs, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (notifError) {
        console.error('Error fetching notifications:', notifError);
    } else {
        console.log('\nRecent Notifications:');
        console.log(JSON.stringify(notifs, null, 2));
    }
}

checkBookings();
