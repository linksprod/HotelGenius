import fs from 'fs';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

async function applyMigration() {
    console.log("Reading migration file...");
    const sql = fs.readFileSync('supabase/migrations/20260708140000_add_loyalty_to_hotel_about.sql', 'utf8');

    console.log("Posting to exec_sql RPC via fetch...");
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
        const text = await response.text();
        console.error('REST RPC failed:', response.status, text);
    } else {
        console.log('REST RPC succeeded! Migration applied successfully!');
    }
}

applyMigration();
