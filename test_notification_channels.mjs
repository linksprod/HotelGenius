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
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !serviceKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function testChannels() {
    console.log("=== Testing Notification Channels Mapping ===\n");

    const guestId = '123e4567-e89b-12d3-a456-426614174000';

    await supabase.from('notification_preferences').upsert({
        user_id: guestId,
        email_enabled: true,
        push_enabled: true,
        sms_enabled: true,
        whatsapp_enabled: false,
        dnd_enabled: false
    });

    const testCases = [
        { type: 'booking_confirmed', expected: ['email', 'push'], priority: 'normal' },
        { type: 'booking_cancelled', expected: ['email', 'push', 'sms'], priority: 'high' },
        { type: 'booking_reminder', expected: ['push', 'sms'], priority: 'normal' },
        { type: 'checkin_ready', expected: ['push', 'sms'], priority: 'normal' },
        { type: 'checkout_overdue', expected: ['push', 'sms', 'in_app'], priority: 'high' },
        { type: 'room_ready', expected: ['push', 'in_app'], priority: 'normal' },
        { type: 'service_ticket_completed', expected: ['push'], priority: 'normal' }
    ];

    let passed = 0;

    for (const tc of testCases) {
        const { data: channels, error } = await supabase.rpc('get_effective_channels', {
            p_user_id: guestId,
            p_notification_type: tc.type,
            p_priority: tc.priority
        });

        if (error) {
            console.error(`Error for ${tc.type}:`, error);
            continue;
        }

        const channelsSorted = channels ? channels.sort() : [];
        const expectedSorted = tc.expected.sort();
        const isMatch = JSON.stringify(channelsSorted) === JSON.stringify(expectedSorted);

        if (isMatch) {
            console.log(`✅ ${tc.type.padEnd(25)} -> Matches Expected: ${expectedSorted.join('+')}`);
            passed++;
        } else {
            console.log(`❌ ${tc.type.padEnd(25)} -> Expected: ${expectedSorted.join('+')}, Got: ${channelsSorted.join('+')}`);
        }
    }

    console.log(`\nResults: ${passed}/${testCases.length} tests passed.`);
}

testChannels().catch(console.error);
