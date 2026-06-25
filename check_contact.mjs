import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkContact() {
    // Let's get a real hotel id first
    const { data: hotels, error: hError } = await supabase.from('hotels').select('id, name').limit(1);
    if (hError || !hotels || hotels.length === 0) {
        console.error("Error fetching hotel:", hError?.message || "No hotels found");
        return;
    }
    const hotelId = hotels[0].id;
    console.log(`Using hotel: ${hotels[0].name} (${hotelId})`);

    console.log("Fetching conversations with filters like in ContactSettings...");
    const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('conversation_type', 'concierge')
        .eq('current_handler', 'human')
        .order('created_at', { ascending: false });

    if (convError) {
        console.error("Error fetching conversations:", convError.message);
    } else {
        console.log("Conversations count:", conversations.length);
        console.log("Conversations:", conversations);
    }

    if (conversations.length > 0) {
        const convIds = conversations.map(c => c.id);
        const { data: msgs, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .in('conversation_id', convIds)
            .order('created_at', { ascending: true });

        if (msgError) {
            console.error("Error fetching messages:", msgError.message);
        } else {
            console.log("Messages count:", msgs.length);
            console.log("Messages sample:", msgs.slice(0, 3));
        }
    }
}

checkContact();
