
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifySchema() {
    console.log("Checking for tables...");

    const checkTable = async (name) => {
        const { error } = await supabase.from(name).select('*').limit(0);
        if (error) {
            console.log(`Table ${name} NOT found: ${error.message}`);
            return false;
        } else {
            console.log(`Table ${name} FOUND!`);
            return true;
        }
    };

    const nFound = await checkTable('notifications');
    const pFound = await checkTable('notification_preferences');

    if (nFound && pFound) {
        console.log("SUCCESS: Database schema is ready.");
    } else {
        console.log("FAILURE: Schema is still missing.");
    }
}

verifySchema();
