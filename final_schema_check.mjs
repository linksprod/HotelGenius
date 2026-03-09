
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log("Fetching one row from service_requests to see columns...");
    const { data, error } = await supabase.from('service_requests').select('*').limit(1);

    if (error) {
        console.error("Error:", error);
    } else if (data && data.length > 0) {
        console.log("Columns found in a row:", Object.keys(data[0]));
    } else {
        console.log("Table is empty. Trying to describe via RPC if possible, or just insert and delete.");
        // Try to insert a dummy row and see what happens
        const { data: inserted, error: iError } = await supabase.from('service_requests').insert({ description: 'schema_check_test' }).select().single();
        if (iError) {
            console.error("Insert error:", iError);
        } else {
            console.log("Inserted row columns:", Object.keys(inserted));
            // Clean up
            await supabase.from('service_requests').delete().eq('id', inserted.id);
        }
    }
}

checkSchema();
