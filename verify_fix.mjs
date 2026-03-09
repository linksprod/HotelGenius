
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyFix() {
    const FIESTA_ID = "7e10c3dc-5d19-492e-a5d2-42838e7580ec";
    const TEST_USER_ID = "3e4af4c8-67eb-4783-866c-fb0fcc8dd265"; // One of the users we saw earlier

    console.log(`Verifying fix for Fiesta (${FIESTA_ID}) and user (${TEST_USER_ID})...`);

    // 1. Simulate the roomService.ts fix: Ensure guest is associated with Fiesta
    console.log("Simulating guest-hotel association...");
    const { data: guest, error: gError } = await supabase
        .from('guests')
        .upsert({
            user_id: TEST_USER_ID,
            hotel_id: FIESTA_ID,
            first_name: 'Verification',
            last_name: 'Guest'
        }, { onConflict: 'user_id' }) // Assuming user_id is unique or we use id if we have it
        .select()
        .single();

    if (gError) {
        console.error("Error upserting guest:", gError);
        return;
    }
    console.log("Guest record ensured:", guest.id, "Hotel:", guest.hotel_id);

    // 2. Create a service request for this guest
    console.log("Creating test service request...");
    const { data: request, error: rError } = await supabase
        .from('service_requests')
        .insert({
            guest_id: TEST_USER_ID,
            description: 'Verification Request - ' + new Date().toISOString(),
            status: 'pending',
            type: 'service'
        })
        .select()
        .single();

    if (rError) {
        console.error("Error creating request:", rError);
        return;
    }
    console.log("Test request created:", request.id);

    // 3. Simulate the useServiceRequests.tsx / useAdminNotifications.ts Double Fetch
    console.log("--- SIMULATING DOUBLE FETCH ---");

    // Step A: Get all user_ids for Fiesta
    const { data: fiestaGuests } = await supabase
        .from('guests')
        .select('user_id')
        .eq('hotel_id', FIESTA_ID);

    const userIds = fiestaGuests?.map(g => g.user_id).filter(Boolean) || [];
    console.log(`Found ${userIds.length} user_ids for Fiesta.`);

    // Step B: Fetch requests for these user_ids
    const { data: visibleRequests, error: vError } = await supabase
        .from('service_requests')
        .select('*')
        .in('guest_id', userIds);

    if (vError) {
        console.error("Double fetch failed:", vError);
    } else {
        console.log(`Visible requests for Fiesta admin: ${visibleRequests?.length || 0}`);
        const found = visibleRequests?.some(r => r.id === request.id);
        console.log(`Is our new test request visible? ${found ? "YES ✅" : "NO ❌"}`);
    }

    // Clean up
    console.log("Cleaning up test data...");
    await supabase.from('service_requests').delete().eq('id', request.id);
}

verifyFix();
