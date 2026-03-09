
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SERVICE_ROLE_KEY not found in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function inspectSchema() {
    console.log("Inspecting service_requests schema with SERVICE_ROLE...");
    const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching data:", error);
        // If it still says column doesn't exist, try to list columns another way
        if (error.message.includes('hotel_id')) {
            console.log("CONFIRMED: hotel_id column is missing in service_requests!");
        }
    } else if (data && data.length > 0) {
        console.log("Columns in service_requests:", Object.keys(data[0]).join(', '));
    } else {
        console.log("Table service_requests is empty or inaccessible even with service_role.");
    }
}

inspectSchema();
