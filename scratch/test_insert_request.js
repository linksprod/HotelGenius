import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testInsert() {
    // 1. Get Palais Bayram hotel ID
    const { data: hotel } = await supabase.from('hotels').select('id').eq('slug', 'hotel-palais-bayram').single();
    console.log("Hotel ID:", hotel?.id);

    // 2. Get room 406 ID
    const { data: room } = await supabase.from('rooms').select('id').eq('room_number', '406').single();
    console.log("Room ID:", room?.id);

    // 3. Get a category ID
    const { data: categories } = await supabase.from('request_categories').select('id').limit(1);
    const categoryId = categories?.[0]?.id;
    console.log("Category ID:", categoryId);

    // 4. Try insert using service role (to check if database schema/constraints allow it)
    const { data: insertResult, error: insertError } = await supabase
        .from('service_requests')
        .insert({
            guest_id: '00000000-0000-0000-0000-000000000000', // Dummy guest ID
            room_id: room?.id,
            room_number: '406',
            guest_name: 'Test Guest',
            type: 'service',
            description: 'Test Hangers request',
            category_id: categoryId,
            status: 'pending',
            hotel_id: hotel?.id
        })
        .select();

    console.log("Insert Result:", insertResult);
    console.log("Insert Error:", insertError);
}

testInsert();
