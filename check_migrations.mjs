
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkMigrations() {
    console.log("Checking applied migrations...");
    const { data, error } = await supabase.from('_supabase.migrations').select('*').order('version', { ascending: false }).limit(10);

    if (error) {
        console.log("Could not find _supabase.migrations. Maybe it's in supabase_migrations schema?");
        const { data: data2, error: error2 } = await supabase.from('supabase_migrations.schema_migrations').select('*').limit(10);
        if (error2) {
            console.error("Migration check failed:", error2);
        } else {
            console.log("Migrations found in supabase_migrations.schema_migrations:");
            console.log(data2);
        }
    } else {
        console.log("Migrations found in _supabase.migrations:");
        console.log(data);
    }
}

checkMigrations();
