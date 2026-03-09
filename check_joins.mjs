
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log("Checking categories and items...");

    const { error: cError } = await supabase.from('request_categories').select('hotel_id').limit(1);
    console.log(`request_categories.hotel_id: ${cError ? 'MISSING (' + cError.message + ')' : 'EXISTS'}`);

    const { error: iError } = await supabase.from('request_items').select('hotel_id').limit(1);
    console.log(`request_items.hotel_id: ${iError ? 'MISSING (' + iError.message + ')' : 'EXISTS'}`);
}

checkSchema();
