
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function inspectSchema() {
    console.log("Inspecting service_requests schema with SERVICE_ROLE (hardcoded)...");
    const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching data:", error);
    } else if (data && data.length >= 0) {
        // Even if data is empty, some clients return the columns in the first row if we do a select * on a table with rows
        // If it's empty, we can try to insert a dummy row then delete it to see the schema
        if (data.length > 0) {
            console.log("Columns in service_requests:", Object.keys(data[0]).join(', '));
        } else {
            console.log("Table is empty. Attempting to insert a temporary dummy row to inspect schema...");
            // We need room_id and guest_id which are required in types
            // Let's find a room and a guest first
            const { data: rooms } = await supabase.from('rooms').select('id').limit(1);
            const { data: guests } = await supabase.from('guests').select('id').limit(1);

            if (rooms && rooms.length > 0 && guests && guests.length > 0) {
                const { data: dummy, error: iError } = await supabase
                    .from('service_requests')
                    .insert({
                        room_id: rooms[0].id,
                        guest_id: guests[0].id,
                        type: 'test',
                        status: 'pending'
                    })
                    .select('*');

                if (iError) {
                    console.error("Insert error:", iError);
                } else if (dummy && dummy.length > 0) {
                    console.log("Successfully inserted dummy row. Columns:", Object.keys(dummy[0]).join(', '));
                    // Cleanup
                    await supabase.from('service_requests').delete().eq('id', dummy[0].id);
                }
            } else {
                console.log("Could not find room or guest to create dummy request.");
            }
        }
    }
}

inspectSchema();
