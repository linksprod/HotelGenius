import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

// We will use service_role to ensure a test user exists, then authenticate as them
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const email = "temp_guest_test@genius.app";
  const password = "Password123!";

  console.log("Ensuring test guest user exists...");
  // Sign up if not exists (using admin to create or just signUp)
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  let userId;
  if (authError) {
    if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
      console.log("Test user already exists, fetching their ID...");
      const { data: users } = await adminClient.auth.admin.listUsers();
      const existing = users.users.find(u => u.email === email);
      userId = existing.id;
    } else {
      console.error("Failed to ensure user:", authError);
      return;
    }
  } else {
    userId = authUser.user.id;
  }
  console.log("Test User ID:", userId);

  // Now create a client using the public key and sign in
  const VITE_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTE_test_key_placeholder"; // Wait, we can get the actual anon key from .env!
  
  // Let's get the actual anon key from .env. We know it from check_schema.mjs:
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTE4NTgsImV4cCI6MjA1NTYyNzg1OH0.Ce053YUmDJ2lFS1f6_BRsOUsEezstxUmVZ1tanXPeC4";
  
  const client = createClient(SUPABASE_URL, ANON_KEY);
  
  console.log("Signing in as guest...");
  const { data: sessionData, error: signInError } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("Sign in failed:", signInError);
    return;
  }

  console.log("Sign in successful. Attempting to insert notification...");
  
  const payload = {
    hotel_id: "6e67afe7-ecc0-4cb1-9465-b3234edc19fc",
    type: "service_ticket_created",
    channel: "in_app",
    recipient_type: "staff",
    recipient_id: "00000000-0000-0000-0000-000000000000",
    title: "Test guest request",
    body: "Test guest body",
    priority: "normal",
    source_module: "Service",
    source_event: "created",
    reference_id: "68003931-fca8-4dbd-8f1b-e0b85d1e0cb0",
    reference_type: "ServiceRequest",
    idempotency_key: "test-guest-insert-" + Date.now(),
    status: "pending"
  };

  const { data, error } = await client
    .from('notifications')
    .insert(payload)
    .select();

  if (error) {
    console.error("INSERT FAILED WITH ERROR:");
    console.error(error);
  } else {
    console.log("INSERT SUCCEEDED:", data);
  }

  // Clean up test user
  console.log("Cleaning up test user...");
  await adminClient.auth.admin.deleteUser(userId);
}

run();
