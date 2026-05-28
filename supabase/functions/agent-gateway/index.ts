import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Authenticate
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = authHeader.split('Bearer ')[1]
    
    // Verify API key and get hotel_id
    const { data: hotelData, error: hotelError } = await supabaseClient
      .from('hotels')
      .select('id, name, slug, colors')
      .eq('api_key', apiKey)
      .single()

    if (hotelError || !hotelData) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const hotelId = hotelData.id

    const url = new URL(req.url)
    const pathname = url.pathname.replace('/agent-gateway', '') // Handle both local and deployed paths

    // GET /context
    if (req.method === 'GET' && (pathname === '/context' || pathname === '/context/')) {
      const guestEmail = url.searchParams.get('guest_email')

      // Fetch restaurants, spa services, events
      const [restaurants, spaServices, events] = await Promise.all([
        supabaseClient.from('restaurants').select('*').eq('hotel_id', hotelId),
        supabaseClient.from('spa_services').select('*').eq('hotel_id', hotelId),
        supabaseClient.from('events').select('*').eq('hotel_id', hotelId),
      ])

      let guestContext = null

      if (guestEmail) {
        const { data: guest } = await supabaseClient
          .from('guests')
          .select('id, first_name, last_name, email, phone')
          .eq('email', guestEmail)
          .eq('hotel_id', hotelId)
          .single()

        if (guest) {
          const { data: digitalTwin } = await supabaseClient
            .from('guest_digital_twin')
            .select('snapshot')
            .eq('guest_id', guest.id)
            .single()

          guestContext = {
            guest,
            digital_twin: digitalTwin?.snapshot || null
          }
        }
      }

      return new Response(JSON.stringify({
        hotel: hotelData,
        restaurants: restaurants.data || [],
        spa_services: spaServices.data || [],
        events: events.data || [],
        guest_context: guestContext
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /book/restaurant
    if (req.method === 'POST' && (pathname === '/book/restaurant' || pathname === '/book/restaurant/')) {
      const { guest_email, restaurant_id, reservation_time, number_of_guests, special_requests } = await req.json()
      
      const { data: guest } = await supabaseClient.from('guests').select('id').eq('email', guest_email).eq('hotel_id', hotelId).single()
      if (!guest) throw new Error('Guest not found')

      const { data, error } = await supabaseClient.from('table_reservations').insert({
        restaurant_id,
        guest_id: guest.id,
        reservation_time,
        number_of_guests,
        special_requests,
        status: 'confirmed' // Assuming default status
      }).select().single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, reservation: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /book/spa
    if (req.method === 'POST' && (pathname === '/book/spa' || pathname === '/book/spa/')) {
      const { guest_email, service_id, start_time, special_requests } = await req.json()
      
      const { data: guest } = await supabaseClient.from('guests').select('id').eq('email', guest_email).eq('hotel_id', hotelId).single()
      if (!guest) throw new Error('Guest not found')

      const { data, error } = await supabaseClient.from('spa_bookings').insert({
        service_id,
        guest_id: guest.id,
        start_time,
        special_requests,
        status: 'confirmed'
      }).select().single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, booking: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /book/event
    if (req.method === 'POST' && (pathname === '/book/event' || pathname === '/book/event/')) {
      const { guest_email, event_id, tickets_count } = await req.json()
      
      const { data: guest } = await supabaseClient.from('guests').select('id').eq('email', guest_email).eq('hotel_id', hotelId).single()
      if (!guest) throw new Error('Guest not found')

      const { data, error } = await supabaseClient.from('event_reservations').insert({
        event_id,
        guest_id: guest.id,
        tickets_count,
        status: 'confirmed'
      }).select().single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, reservation: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /request/housekeeping
    if (req.method === 'POST' && (pathname === '/request/housekeeping' || pathname === '/request/housekeeping/')) {
      const { guest_email, room_number, request_type, description } = await req.json()
      
      const { data: guest } = await supabaseClient.from('guests').select('id').eq('email', guest_email).eq('hotel_id', hotelId).single()
      if (!guest) throw new Error('Guest not found')

      const { data, error } = await supabaseClient.from('guest_requests').insert({
        hotel_id: hotelId,
        guest_id: guest.id,
        room_number,
        request_type,
        description,
        status: 'pending'
      }).select().single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, request: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
