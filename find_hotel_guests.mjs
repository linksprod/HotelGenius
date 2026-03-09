
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkHotel() {
    console.log("Fetching hotel by slug 'fiesta'...");

    const { data: hotel, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('slug', 'fiesta')
        .maybeSingle();

    if (error) {
        console.error("Error fetching hotel:", error);
    } else if (hotel) {
        console.log(`Hotel found: Name=${hotel.name}, ID=${hotel.id}`);

        // Find guests for this hotel
        const { data: guests } = await supabase
            .from('guests')
            .select('id, user_id, room_number, hotel_id')
            .eq('hotel_id', hotel.id);

        console.log(`Guests found with this hotel_id: ${guests?.length || 0}`);
        if (guests && guests.length > 0) {
            console.log("Sample guest:", guests[0]);
        }
    } else {
        console.log("Hotel 'fiesta' not found.");
    }
}

checkHotel();
