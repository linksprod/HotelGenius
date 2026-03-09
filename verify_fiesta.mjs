
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyFiestaData() {
    const FIESTA_ID = "7e10c3dc-5d19-492e-a5d2-42838e7580ec";

    console.log(`Checking data for Fiesta (${FIESTA_ID})...`);

    // Fetch Fiesta guests
    const { data: guests } = await supabase.from('guests').select('id, user_id, first_name, last_name').eq('hotel_id', FIESTA_ID);
    console.log(`Guests in Fiesta: ${guests?.length || 0}`);

    if (!guests || guests.length === 0) return;

    const guestIds = guests.map(g => g.id);
    const userIds = guests.map(g => g.user_id).filter(Boolean);

    console.log(`Guest IDs: ${guestIds.slice(0, 3)}...`);
    console.log(`User IDs: ${userIds.slice(0, 3)}...`);

    // Check if any service_requests match these IDs
    const { data: matchingRequests } = await supabase
        .from('service_requests')
        .select('id, guest_id, description')
        .or(`guest_id.in.(${guestIds.join(',')}),guest_id.in.(${userIds.join(',')})`);

    console.log(`Service requests matching Fiesta guests: ${matchingRequests?.length || 0}`);
    if (matchingRequests && matchingRequests.length > 0) {
        console.log("Sample match:", matchingRequests[0]);
    }

    // Check ALL service requests to see what guest_ids they use
    const { data: allRequests } = await supabase.from('service_requests').select('guest_id').limit(10);
    console.log("Random guest_ids from service_requests:", allRequests?.map(r => r.guest_id));
}

verifyFiestaData();
