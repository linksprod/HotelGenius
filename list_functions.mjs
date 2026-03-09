
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function listFunctions() {
    console.log("Listing public functions...");
    const { data, error } = await supabase.rpc('get_table_relationships', { t_name: 'service_requests' }); // Just to test if rpc works

    // There is no built-in listFunctions in supabase-js.
    // We can try to query information_schema.routines
    const { data: routines, error: rError } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_schema', 'public');

    if (rError) {
        console.error("Error listing routines:", rError);
        // Try direct select from pg_proc if possible
    } else {
        console.log("Routines found:");
        console.log(routines.map(r => r.routine_name).join(', '));
    }
}

listFunctions();
