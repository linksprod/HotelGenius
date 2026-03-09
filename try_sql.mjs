
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function tryExecSql() {
    console.log("Attempting to add column via SQL...");
    const sql = "ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES public.hotels(id);";

    // Some setups have a custom RPC for this
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
        console.error("RPC 'exec_sql' failed:", error.message);
        console.log("Trying 'run_sql'...");
        const { data: d2, error: e2 } = await supabase.rpc('run_sql', { sql: sql });
        if (e2) {
            console.error("RPC 'run_sql' failed:", e2.message);
        } else {
            console.log("SUCCESS via 'run_sql'");
        }
    } else {
        console.log("SUCCESS via 'exec_sql'");
    }
}

tryExecSql();
