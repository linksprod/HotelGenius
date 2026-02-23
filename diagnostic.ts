
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkActualData() {
    const { data: hotels, error: hError } = await supabase.from('hotels').select('*');
    const { data: restaurants, error: rError } = await supabase.from('restaurants').select('*');

    const result = {
        hotels,
        restaurants,
        hError,
        rError
    };

    fs.writeFileSync('diagnostic-output.txt', JSON.stringify(result, null, 2));
    console.log('Output written to diagnostic-output.txt');
}

checkActualData();
