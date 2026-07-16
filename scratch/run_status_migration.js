/**
 * Runs the ALTER TABLE migration via Supabase's pg_dump / Management API.
 * Uses the REST POST /sql endpoint available on recent Supabase projects.
 */

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

// Extract project ref from URL  (qvhthjtdzeerafabfbfc)
const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];

// Supabase Management API requires a personal access token, not service role key.
// However, we can try the /rest/v1/rpc with a custom function approach.
// Alternative: use the pg endpoint if accessible.

async function tryManagementSQL() {
  const sql = `ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'essai_en_cours';`;
  
  // Try 1: Management API SQL endpoint
  const url1 = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  console.log("Trying Management API:", url1);
  const r1 = await fetch(url1, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  const t1 = await r1.text();
  console.log("Management API result:", r1.status, t1);
  
  if (r1.ok) {
    console.log("SUCCESS via Management API!");
    return;
  }

  // Try 2: pg endpoint  
  const url2 = `${SUPABASE_URL}/pg/query`;
  console.log("\nTrying pg endpoint:", url2);
  const r2 = await fetch(url2, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ query: sql }),
  });
  const t2 = await r2.text();
  console.log("pg endpoint result:", r2.status, t2);
}

tryManagementSQL();
