import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qvhthjtdzeerafabfbfc.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";
const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
    console.log("--- Latest 10 Notifications ---");
    const { data: notifs, error: nErr } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (nErr) console.error("Error fetching notifications:", nErr);
    else console.table(notifs.map(n => ({
        id: n.notification_id,
        type: n.type,
        status: n.status,
        recipient: n.recipient_id,
        created: n.created_at,
        error: n.error_message
    })));

    console.log("\n--- Latest 5 Table Reservations ---");
    const { data: res, error: rErr } = await supabase
        .from('table_reservations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);

    if (rErr) console.error("Error fetching reservations:", rErr);
    else console.table(res.map(r => ({
        id: r.id,
        status: r.status,
        guest: r.guest_name,
        updated: r.updated_at
    })));
}

run();
