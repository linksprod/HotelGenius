import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Server configuration error: Missing environment variables')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await req.json()
    const { 
      hotelName, 
      slug, 
      primaryColor, 
      secondaryColor, 
      logoUrl, 
      languages, 
      firstName, 
      lastName, 
      email, 
      password 
    } = body

    if (!hotelName || !slug || !email || !password || !firstName || !lastName) {
      throw new Error('Missing required fields for hotel provisioning')
    }

    console.log(`Starting hotel provisioning for: ${hotelName} (${slug})`)

    // 1. Create hotel
    const { data: newHotel, error: hotelError } = await supabaseAdmin
      .from('hotels')
      .insert({
        name: hotelName,
        slug: slug,
        address: 'Default Address',
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl || null,
        languages: languages || ['en'],
      })
      .select()
      .single()

    if (hotelError) throw new Error(`Failed to create hotel: ${hotelError.message}`)
    const newHotelId = newHotel.id
    console.log(`Hotel created with ID: ${newHotelId}`)

    // 2. Create admin user
    const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    })

    if (userError) {
      // Rollback hotel creation
      await supabaseAdmin.from('hotels').delete().eq('id', newHotelId)
      throw new Error(`Failed to create admin user: ${userError.message}`)
    }

    const userId = newUser.user.id
    console.log(`Admin user created with ID: ${userId}`)

    // 3. Assign hotel_admin role
    const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
      user_id: userId,
      role: 'hotel_admin',
      hotel_id: newHotelId,
    })

    if (roleError) {
      throw new Error(`Role assignment failed: ${roleError.message}`)
    }

    // 4. Remove auto-assigned 'user' role if any
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'user')

    // 5. Create guest profile for name display
    const { error: guestError } = await supabaseAdmin.from('guests').insert({
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      guest_type: 'Staff',
    })

    if (guestError) {
       console.error(`Failed to create guest profile: ${guestError.message}`)
       // Non-fatal error, we can continue
    }

    console.log(`Provisioning completed successfully for hotel ${newHotelId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        hotelId: newHotelId,
        message: 'Hotel and admin user provisioned successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error provisioning hotel:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
