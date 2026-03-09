
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTE4NTgsImV4cCI6MjA1NTYyNzg1OH0.Ce053YUmDJ2lFS1f6_BRsOUsEezstxUmVZ1tanXPeC4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function inspectSchema() {
    console.log("Inspecting service_requests schema...");
    const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching data:", error);
    } else if (data && data.length > 0) {
        console.log("Actually existing columns in service_requests:");
        console.log(Object.keys(data[0]).join(', '));
    } else {
        console.log("No data found in service_requests to inspect.");
        // Try to fetch from another table to see if multi-tenancy is active
        const { data: guests, error: gError } = await supabase.from('guests').select('*').limit(1);
        if (guests && guests.length > 0) {
            console.log("Actually existing columns in guests:");
            console.log(Object.keys(guests[0]).join(', '));
        }
    }
}

inspectSchema();
