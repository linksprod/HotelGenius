import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, password, hotelName } = await req.json();

    if (!firstName || !lastName || !email || !password || !hotelName) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate slug from hotelName
    const slug = hotelName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if slug exists
    const { data: existingHotel } = await supabaseAdmin
      .from("hotels")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingHotel) {
      return new Response(
        JSON.stringify({ error: "Hotel name is already taken. Please try another." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: `Auth Error: ${createError.message}` }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: hotelData, error: hotelError } = await supabaseAdmin
      .from("hotels")
      .insert({
        name: hotelName,
        slug,
        address: "TBD", // default placeholder
      })
      .select()
      .single();

    if (hotelError) {
      // Cleanup user if hotel creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(JSON.stringify({ error: `DB Error: ${hotelError.message}` }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hotelId = hotelData.id;

    // Insert user role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role: "hotel_admin", hotel_id: hotelId });

    if (roleError) {
      console.error("Role error:", roleError);
    }

    // Remove auto-inserted 'user' role
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", newUser.user.id)
      .eq("role", "user");

    // Insert into guests as Staff
    const { error: guestError } = await supabaseAdmin.from("guests").insert({
      user_id: newUser.user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      guest_type: "Staff",
      hotel_id: hotelId,
    });

    if (guestError) {
      console.error("Guest error:", guestError);
    }

    return new Response(
      JSON.stringify({ success: true, user_id: newUser.user.id, hotel_slug: slug }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: `System Error: ${err.message}` }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
