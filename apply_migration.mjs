import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function applyMigration() {
    console.log("Reading migration file...");
    const sql = fs.readFileSync('supabase/migrations/20260309113000_fix_effective_channels_matrix.sql', 'utf8');

    console.log("Executing run_sql RPC...");
    const { data, error } = await supabase.rpc('run_sql', { sql });

    if (error) {
        console.error("Migration failed:", error.message);
    } else {
        console.log("Migration applied successfully!");
    }
}

applyMigration();
