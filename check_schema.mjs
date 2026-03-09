import { createClient } from '@supabase/supabase-js';
import pkg from 'dotenv';
const { config } = pkg;

config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function listColumns() {
    console.log('Listing columns for service_requests...');

    const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching service_requests:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in service_requests:', Object.keys(data[0]));
    } else {
        console.log('No data in service_requests.');
    }

    const { data: rooms, error: rError } = await supabase
        .from('rooms')
        .select('*')
        .limit(1);
    if (rooms && rooms.length > 0) {
        console.log('Columns in rooms:', Object.keys(rooms[0]));
    }
}

listColumns();
