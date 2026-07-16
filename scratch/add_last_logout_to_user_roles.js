import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const sql = `
    ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS last_logout_at TIMESTAMP WITH TIME ZONE;
    
    DROP POLICY IF EXISTS "Users can update their own user_roles" ON public.user_roles;
    CREATE POLICY "Users can update their own user_roles"
    ON public.user_roles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  `;
  
  // exec_sql expects single statements, let's split it like in apply_pref_migration.mjs
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    const { data, error } = await supabase.rpc('exec_sql', { query: stmt + ';' });
    if (error) {
      console.error("Failed on statement:", stmt);
      console.error(error);
    } else {
      console.log("Success on statement:", stmt.substring(0, 50) + "...");
    }
  }
}

main();
