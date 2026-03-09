
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkFKs() {
    console.log("Checking foreign keys for service_requests...");

    const { data, error } = await supabase.rpc('get_table_fks', { table_name: 'service_requests' });
    if (error) {
        // Fallback to direct query if RPC doesn't exist
        const { data: fkData, error: fkError } = await supabase.from('information_schema.key_column_usage')
            .select('column_name, referenced_table_name, referenced_column_name')
            .eq('table_name', 'service_requests')
            .eq('table_schema', 'public');

        if (fkError) {
            console.error("Error fetching FKs:", fkError);
        } else {
            console.log("Foreign keys in service_requests:");
            console.log(fkData);
        }
    } else {
        console.log("Foreign keys (RPC):", data);
    }
}

checkFKs();
