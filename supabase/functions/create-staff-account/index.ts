import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const callerToken = authHeader.replace("Bearer ", "");

    // Use getUser with the token to verify the user is logged in
    const { data: { user: callerUser }, error: userError } = await supabaseAuth.auth.getUser(callerToken);

    if (userError || !callerUser) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Invalid token", details: userError?.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = callerUser.id;

    // Use service role client (supabaseAdmin) to check roles reliably
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: rolesData, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    }

    const roles = (rolesData || []).map((r: any) => r.role);
    console.log("Caller roles:", roles);

    const hasPermission = roles.includes("admin") || roles.includes("super_admin");

    if (!hasPermission) {
      return new Response(JSON.stringify({ error: "Admin access required. Your roles: " + roles.join(", ") }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { first_name, last_name, email, password, role, service_type, hotel_id } = await req.json();
    console.log("Request Body:", { first_name, last_name, email, role, hotel_id });

    // Validate inputs
    if (!first_name || !last_name || !email || !password || !role) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const validRoles = ["admin", "moderator", "staff"];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate service_type for moderator role
    if (role === "moderator") {
      const validServiceTypes = ["housekeeping", "maintenance", "security", "it_support"];
      if (!service_type || !validServiceTypes.includes(service_type)) {
        return new Response(
          JSON.stringify({ error: "A valid service type is required for moderators" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Use service role to create user (already initialized as supabaseAdmin above)
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name, last_name },
      });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert the staff/moderator/admin role with hotel_id.
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role, hotel_id });

    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Remove the auto-inserted 'user' role from the trigger if it exists
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", newUser.user.id)
      .eq("role", "user");

    // Insert moderator service type if applicable
    if (role === "moderator" && service_type) {
      const { error: serviceError } = await supabaseAdmin
        .from("moderator_services")
        .insert({ user_id: newUser.user.id, service_type });

      if (serviceError) {
        return new Response(
          JSON.stringify({ error: serviceError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Insert guest profile and link to hotel_id
    await supabaseAdmin.from("guests").insert({
      user_id: newUser.user.id,
      first_name,
      last_name,
      email,
      guest_type: "Staff",
      hotel_id,
    });

    return new Response(
      JSON.stringify({ success: true, user_id: newUser.user.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
