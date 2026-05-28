import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GuestTwin {
  guest_id: string;
  name: string;
  language: string;
  nationality: string;
  room_preference: string;
  dietary: string;
  previous_stays: number;
  loyalty_tier: 'new' | 'returning' | 'loyal' | 'vip';
  avg_upsell: string[];
  last_interaction: string;
  special_requests: string;
  communication: string;
}

function getLoyaltyTier(stays: number): 'new' | 'returning' | 'loyal' | 'vip' {
  if (stays === 0) return 'new';
  if (stays <= 2) return 'returning';
  if (stays <= 5) return 'loyal';
  return 'vip';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request: support both query params and JSON body
    let guest_id: string | null = null;
    let hotel_id: string | null = null;

    const url = new URL(req.url);
    guest_id = url.searchParams.get('guest_id');
    hotel_id = url.searchParams.get('hotel_id');

    if (!guest_id || !hotel_id) {
      try {
        const body = await req.json();
        guest_id = body.guest_id ?? guest_id;
        hotel_id = body.hotel_id ?? hotel_id;
      } catch {
        // body may be empty, that's fine if params already set
      }
    }

    if (!guest_id) {
      return new Response(
        JSON.stringify({ error: 'guest_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 1. Fetch guest base record ────────────────────────────────
    const { data: guest, error: guestErr } = await supabase
      .from('guests')
      .select('id, first_name, last_name, nationality, language, room_number, created_at')
      .eq('id', guest_id)
      .maybeSingle();

    if (guestErr) throw guestErr;
    if (!guest) {
      return new Response(
        JSON.stringify({ error: 'Guest not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 2. Fetch guest preferences ────────────────────────────────
    const { data: preferences } = await supabase
      .from('guest_preferences')
      .select('category, value')
      .eq('guest_id', guest_id);

    const prefMap: Record<string, string> = {};
    for (const pref of preferences ?? []) {
      prefMap[pref.category] = pref.value;
    }

    // ── 3. Fetch spa bookings ─────────────────────────────────────
    const spaQuery = supabase
      .from('spa_bookings')
      .select('service_id, status, date')
      .eq('user_id', guest_id)
      .eq('status', 'confirmed');

    if (hotel_id) spaQuery.eq('hotel_id', hotel_id);
    const { data: spaBookings } = await spaQuery;

    // ── 4. Fetch table reservations ───────────────────────────────
    const tableQuery = supabase
      .from('table_reservations')
      .select('restaurant_id, status, date')
      .eq('user_id', guest_id)
      .eq('status', 'confirmed');

    if (hotel_id) tableQuery.eq('hotel_id', hotel_id);
    const { data: tableReservations } = await tableQuery;

    // ── 5. Fetch event reservations ───────────────────────────────
    const eventQuery = supabase
      .from('event_reservations')
      .select('event_id, status, date')
      .eq('user_id', guest_id)
      .eq('status', 'confirmed');

    if (hotel_id) eventQuery.eq('hotel_id', hotel_id);
    const { data: eventReservations } = await eventQuery;

    // ── 6. Compute derived fields ─────────────────────────────────
    const allBookings = [
      ...(spaBookings ?? []).map(b => ({ type: 'spa', date: b.date })),
      ...(tableReservations ?? []).map(r => ({ type: 'restaurant', date: r.date })),
      ...(eventReservations ?? []).map(e => ({ type: 'event', date: e.date })),
    ];

    const previousStays = (spaBookings?.length ?? 0) +
      (tableReservations?.length ?? 0) +
      (eventReservations?.length ?? 0);

    // Avg upsell: count by service type
    const upsellCount: Record<string, number> = {};
    for (const b of allBookings) {
      upsellCount[b.type] = (upsellCount[b.type] ?? 0) + 1;
    }
    const avgUpsell = Object.entries(upsellCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);

    // Last interaction date
    const allDates = allBookings.map(b => b.date).filter(Boolean) as string[];
    const lastInteraction = allDates.length > 0
      ? allDates.sort().reverse()[0]
      : new Date().toISOString().split('T')[0];

    // Language: prefer guest record, then preferences
    const language = guest.language ?? prefMap['language'] ?? 'en';

    // Room preference: from preferences or synthesized
    const roomPreference = prefMap['room_preference'] ?? prefMap['room_type'] ?? 'standard';

    // ── 7. Build snapshot ─────────────────────────────────────────
    const snapshot: GuestTwin = {
      guest_id: guest.id,
      name: `${guest.first_name ?? ''} ${guest.last_name ?? ''}`.trim(),
      language,
      nationality: guest.nationality ?? prefMap['nationality'] ?? 'unknown',
      room_preference: roomPreference,
      dietary: prefMap['dietary'] ?? 'none',
      previous_stays: previousStays,
      loyalty_tier: getLoyaltyTier(previousStays),
      avg_upsell: avgUpsell,
      last_interaction: lastInteraction,
      special_requests: prefMap['special_request'] ?? '',
      communication: prefMap['communication'] ?? 'any',
    };

    // ── 8. Upsert into guest_digital_twin ─────────────────────────
    const { error: upsertErr } = await supabase
      .from('guest_digital_twin')
      .upsert(
        {
          guest_id: guest.id,
          hotel_id: hotel_id ?? null,
          snapshot,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'guest_id,hotel_id',
        }
      );

    if (upsertErr) {
      console.error('[get-guest-twin] upsert error:', upsertErr);
      // Non-fatal — still return the snapshot
    }

    return new Response(
      JSON.stringify({ snapshot }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('[get-guest-twin] Error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
