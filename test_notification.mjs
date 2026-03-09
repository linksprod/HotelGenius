import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function testInsert() {
    console.log('Attempting to insert test notification...');

    // Check if table exists first by trying a select
    const { data: countData, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error checking notifications table:', countError);
        return;
    }
    console.log('Current notification count:', countData || 0);

    const testNotification = {
        hotel_id: '00000000-0000-0000-0000-000000000000', // Assuming a default or placeholder ID if needed
        type: 'system_alert',
        channel: 'in_app',
        recipient_type: 'staff',
        recipient_id: '00000000-0000-0000-0000-000000000000',
        title: 'Diagnostic Test',
        body: 'This is a test notification from the diagnostic script.',
        status: 'pending',
        priority: 'normal',
        source_module: 'Diagnostic',
        source_event: 'test_run',
        idempotency_key: `test-${Date.now()}`
    };

    const { data, error } = await supabase
        .from('notifications')
        .insert(testNotification)
        .select();

    if (error) {
        console.error('Failed to insert test notification:', error);
    } else {
        console.log('Successfully inserted test notification:', data);
    }
}

testInsert();
