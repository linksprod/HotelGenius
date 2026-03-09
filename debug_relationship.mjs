
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
    console.log("Checking latest service requests and their guests...");

    const { data: requests, error: rError } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (rError) {
        console.error("Error fetching requests:", rError);
        return;
    }

    if (!requests || requests.length === 0) {
        console.log("No service requests found.");
        return;
    }

    for (const req of requests) {
        console.log(`Request ID: ${req.id}, Guest ID in req: ${req.guest_id}, Created at: ${req.created_at}, Status: ${req.status}`);

        // Try to find guest by id
        const { data: guestById } = await supabase.from('guests').select('id, hotel_id, user_id').eq('id', req.guest_id).maybeSingle();
        if (guestById) {
            console.log(`  -> Found guest by ID match: guest.id=${guestById.id}, hotel_id=${guestById.hotel_id}, user_id=${guestById.user_id}`);
        } else {
            console.log(`  -> NO guest found by ID match.`);
            // Try by user_id
            const { data: guestByUserId } = await supabase.from('guests').select('id, hotel_id, user_id').eq('user_id', req.guest_id).maybeSingle();
            if (guestByUserId) {
                console.log(`  -> Found guest by USER_ID match: guest.id=${guestByUserId.id}, hotel_id=${guestByUserId.hotel_id}, user_id=${guestByUserId.user_id}`);
            } else {
                console.log(`  -> NO guest found by USER_ID match either.`);
            }
        }
    }
}

checkData();
