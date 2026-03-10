import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(
    envFile.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let val = match[2].trim();
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                return [match[1].trim(), val];
            }
            return [null, null];
        })
        .filter(([k]) => k !== null)
);

const supabase = createClient(
    env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    const payload = {
        hotel_id: '00000000-0000-0000-0000-000000000000',
        type: 'booking_confirmed',
        channel: 'in_app',
        recipient_type: 'guest',
        recipient_id: 'cb6315aa-7f1b-4285-b113-16ba6e6fac3e',
        title: 'Booking Confirmed',
        body: 'Reservation at the hotel is confirmed.',
        priority: 'normal',
        source_module: 'Dining',
        source_event: 'confirmed',
        reference_id: '53a4cc69-539a-43b2-b475-ab69cde8d2c8',
        reference_type: 'TableReservation',
        created_by: 'system',
        idempotency_key: 'test_12345_' + Date.now(),
        status: 'pending'
    };

    const { data, error } = await supabase.from('notifications').insert(payload).select();

    if (error) {
        console.error("INSERT ERROR:");
        console.error(JSON.stringify(error, null, 2));
    } else {
        console.log("INSERT SUCCESS:", data);
    }
}

run();
