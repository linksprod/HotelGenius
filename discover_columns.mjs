
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTE4NTgsImV4cCI6MjA1NTYyNzg1OH0.Ce053YUmDJ2lFS1f6_BRsOUsEezstxUmVZ1tanXPeC4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function discoverColumns() {
    console.log("Discovering columns for service_requests...");
    // Try to select one row with *
    const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error selecting *:", error);
        // If * fails, try selecting just ID
        const { data: idData, error: idError } = await supabase
            .from('service_requests')
            .select('id')
            .limit(1);

        if (idError) {
            console.error("Error selecting ID:", idError);
            return;
        }
        console.log("Successfully selected ID. Column 'hotel_id' might be missing or restricted.");
    } else {
        if (data && data.length > 0) {
            console.log("Columns found in a record:");
            console.log(Object.keys(data[0]));
        } else {
            console.log("No records found, but query succeeded.");
        }
    }
}

discoverColumns();
