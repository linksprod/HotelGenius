/**
 * Test script: booking_cancelled notification
 * Run with: node test_cancellation_notification.mjs
 *
 * This script directly invokes the process-notification edge function
 * with a booking_cancelled payload, forcing all 3 channels (email + push + sms).
 * Check Supabase Edge Function logs to verify each provider was called.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTE4NTgsImV4cCI6MjA1NTYyNzg1OH0.ClHMtyprOmgb6Tx__vFlhMOEEz79MXSA_h0JsLVV2C4";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testCancellationNotification() {
    console.log('\n=== Testing booking_cancelled Notification ===\n');

    // Fetch the most recent confirmed or cancelled reservation to use as reference
    const { data: reservations, error: fetchError } = await supabase
        .from('table_reservations')
        .select('id, guest_name, guest_email, guest_phone, date, time, guests, user_id, hotel_id')
        .order('created_at', { ascending: false })
        .limit(5);

    if (fetchError) {
        console.error('Could not fetch reservations:', fetchError.message);
        console.log('Proceeding with a synthetic payload (no real reservation reference)...\n');
    }

    const testReservation = reservations?.[0];
    const recipientId = testReservation?.user_id || '00000000-0000-0000-0000-000000000000';
    const referenceId = testReservation?.id || '00000000-0000-0000-0000-000000000000';

    console.log('Using reservation:', {
        id: referenceId,
        guest_name: testReservation?.guest_name,
        guest_email: testReservation?.guest_email,
        guest_phone: testReservation?.guest_phone,
        date: testReservation?.date,
        time: testReservation?.time,
    });

    const payload = {
        record: {
            notification_id: `test-cancelled-${Date.now()}`,
            hotel_id: testReservation?.hotel_id || null,
            type: 'booking_cancelled',
            recipient_id: recipientId,
            recipient_type: 'guest',
            title: 'Reservation Cancelled ❌',
            body: `Hi ${testReservation?.guest_name || 'Guest'},\n\nYour table reservation at Central Bar on ${testReservation?.date || '2026-03-10'} at ${testReservation?.time || '20:00'} for ${testReservation?.guests || 2} guest(s) has been cancelled.\n\nWe hope to see you soon!`,
            priority: 'normal',
            reference_id: referenceId,
            reference_type: 'TableReservation',
            source_module: 'Dining',
            source_event: 'cancelled',
        },
        bypass_rpc: true,
        forced_channels: ['email', 'push', 'sms'],
    };

    console.log('\nInvoking process-notification edge function...\n');

    const { data, error } = await supabase.functions.invoke('process-notification', {
        body: payload,
    });

    if (error) {
        console.error('❌ Edge function invocation failed:', error);
        return;
    }

    console.log('✅ Edge function response:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n=== Expected in Edge Function logs ===');
    console.log('  [EmailProvider] Sending cancellation email to: <guest_email>');
    console.log('  [MOCK PUSH] Sending via FCM to <recipient_id>');
    console.log(`  [MOCK SMS] → <guest_phone> : <sms_body>`);
}

testCancellationNotification().catch(console.error);
