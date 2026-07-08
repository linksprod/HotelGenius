import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL as string) || "https://qvhthjtdzeerafabfbfc.supabase.co";
const SERVICE_ROLE_KEY = (import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY as string) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

/**
 * Supabase admin client using the service role key.
 * Bypasses RLS — use only in super-admin-restricted contexts.
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});
