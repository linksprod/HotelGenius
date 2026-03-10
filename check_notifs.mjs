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

const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function checkLogs() {
    console.log("Checking recent notifications...");
    const { data: notifs, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching notifications:", error);
        return;
    }

    notifs.forEach(n => {
        console.log(`\nID: ${n.notification_id} | Type: ${n.type} | Status: ${n.status}`);
        console.log(`Recipient: ${n.recipient_id}`);
        if (n.error_message) {
            console.log(`❌ ERROR: ${n.error_message}`);
        } else if (n.status === 'sent') {
            console.log(`✅ SENT AT: ${n.sent_at}`);
        }
    });
}

checkLogs().catch(console.error);
