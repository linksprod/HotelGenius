import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const sql = fs.readFileSync('supabase/migrations/20260709120000_create_platform_bulletins.sql', 'utf8');

// Split SQL into individual statements and run each
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

let success = 0;
let errors = 0;

for (const stmt of statements) {
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
    const text = await response.text();
    console.error('Failed:', stmt.substring(0, 80) + '...', '\n  Error:', text.substring(0, 200));
    errors++;
  } else {
    success++;
    console.log('OK:', stmt.substring(0, 80) + '...');
  }
}

console.log(`\nDone: ${success} succeeded, ${errors} failed`);

// Verify
const { data, error: fetchErr } = await supabase.from('platform_bulletins').select('id, title, is_published, order_index');
if (fetchErr) {
  console.error('Verify failed:', fetchErr.message);
} else {
  console.log('\nBulletins in DB:', JSON.stringify(data, null, 2));
}
