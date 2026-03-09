
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkAllTables() {
    const tables = [
        'service_requests',
        'table_reservations',
        'spa_bookings',
        'event_reservations',
        'messages',
        'conversations',
        'rooms',
        'guests'
    ];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Table ${table}: ERROR - ${error.message}`);
        } else if (data && data.length >= 0) {
            const columns = data.length > 0 ? Object.keys(data[0]) : [];
            // If empty, try to get columns via a dummy filter that won't return anything but might show keys if supported
            // Better: just check if hotel_id is in the error if we try to select it
            const { error: hError } = await supabase.from(table).select('hotel_id').limit(1);
            if (hError) {
                console.log(`Table ${table}: hotel_id MISSING (${hError.message})`);
            } else {
                console.log(`Table ${table}: hotel_id EXISTS`);
            }
        }
    }
}

checkAllTables();
