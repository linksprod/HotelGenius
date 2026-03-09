
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTE4NTgsImV4cCI6MjA1NTYyNzg1OH0.Ce053YUmDJ2lFS1f6_BRsOUsEezstxUmVZ1tanXPeC4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkRooms() {
    console.log("Checking rooms...");
    const { data, error } = await supabase
        .from('rooms')
        .select('id, room_number, hotel_id')
        .limit(5);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${data.length} rooms:`);
    data.forEach(room => {
        console.log(`- Room ${room.room_number}, ID: ${room.id}, Hotel: ${room.hotel_id}`);
    });
}

checkRooms();
