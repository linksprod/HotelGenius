
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qvhthjtdzeerafabfbfc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    try {
        const { data: hotel, error: hotelErr } = await supabase.from('hotels').select('id').eq('slug', 'demo').single();
        if (hotelErr || !hotel) {
            console.log("Demo hotel not found or error:", hotelErr);
            return;
        }

        console.log("Cleaning up for demo hotel ID:", hotel.id);

        // Cleanup items and categories
        const { error: err1 } = await supabase.from('request_items').delete().eq('hotel_id', hotel.id);
        const { error: err2 } = await supabase.from('request_categories').delete().eq('hotel_id', hotel.id);

        console.log("Request items deletion result:", err1 || "Success");
        console.log("Request categories deletion result:", err2 || "Success");

        // Also delete any with NULL hotel_id just in case
        const { error: err3 } = await supabase.from('request_categories').delete().is('hotel_id', null);
        console.log("Null hotel_id categories deletion result:", err3 || "Success");

    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

cleanup();
