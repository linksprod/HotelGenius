import { createClient } from "@supabase/supabase-js";
import fs from "fs";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  // we can't create an RPC via REST directly, we can only call one.
}
run();
