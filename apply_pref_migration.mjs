import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://qvhthjtdzeerafabfbfc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const sql = readFileSync('./supabase/migrations/20260622130000_admin_guest_preferences_rls.sql', 'utf8');

// Split SQL into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

let success = 0;
let errors = 0;

for (const stmt of statements) {
  const { error } = await supabase.rpc('exec_sql', { query: stmt + ';' }).catch(() => ({ error: { message: 'RPC not available' } }));
  if (error) {
    // Try direct REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      body: JSON.stringify({ query: stmt + ';' }),
    });
    if (!response.ok) {
      console.error('Failed:', stmt.substring(0, 60) + '...');
      errors++;
    } else {
      success++;
    }
  } else {
    success++;
  }
}

console.log(`Done: ${success} succeeded, ${errors} failed`);
