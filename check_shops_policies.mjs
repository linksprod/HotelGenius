import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const sql = `
    SELECT
        pol.polname as policy_name,
        pol.cmd as command,
        pg_get_expr(pol.polqual, pol.polrelid) as USING_expr,
        pg_get_expr(pol.polwithcheck, pol.polrelid) as WITH_CHECK_expr
    FROM pg_policy pol
    JOIN pg_class tbl ON pol.polrelid = tbl.oid
    WHERE tbl.relname = 'shops';
  `;
  const { data, error } = await supabase.rpc('run_sql', { sql: sql });
  console.log(error || data);
}
check();
