
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkRelationships() {
    console.log("Checking relationships for service_requests...");

    // We can use the 'postgrest' endpoint info if needed, or just try different join patterns
    // A reliable way via SQL:
    const { data: rels, error: relError } = await supabase.rpc('get_table_relationships', { t_name: 'service_requests' });

    if (relError) {
        // Try another SQL query to find FKs correctly
        const sql = `
            SELECT
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='service_requests';
        `;

        // We don't have a direct SQL execution tool other than supabase cli or RPC.
        // I'll try to find if there's a helpful RPC.
        console.log("RPC 'get_table_relationships' not found. Trying to inspect via Postgrest...");

        // This is a trick: call a non-existent table and see the error message or introspect
        // Actually, just list columns of service_requests again but with more detail if possible
    } else {
        console.log("Relationships:", rels);
    }
}

// Alternative: just try joining on guest_id explicitly in a query
async function testJoins() {
    console.log("Testing joins...");

    const { data: d1, error: e1 } = await supabase
        .from('service_requests')
        .select('id, guests!inner(id, hotel_id)')
        .limit(1);
    console.log("Join 'guests!inner':", e1 ? "FAILED: " + e1.message : "SUCCESS");
    if (d1) console.log(d1);

    // Try specifying the column
    // This is NOT standard Postgrest but some versions support it
    // Actually, the syntax is guests!guest_id(...) if guest_id is the FK to guests
    const { data: d2, error: e2 } = await supabase
        .from('service_requests')
        .select('id, guests!guest_id(id, hotel_id)')
        .limit(1);
    console.log("Join 'guests!guest_id':", e2 ? "FAILED: " + e2.message : "SUCCESS");
    if (d2) console.log(d2);
}

testJoins();
