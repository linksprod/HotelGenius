import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ROLE_HIERARCHY: Record<string, number> = {
  staff: 1,
  moderator: 2,
  admin: 3,
};

const VALID_ROLES = ["staff", "moderator", "admin"];

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

    const callerToken = authHeader.replace("Bearer ", "");

    // Auth client for token verification
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify caller with getUser
    const { data: { user: callerUser }, error: userError } = await authClient.auth.getUser(callerToken);

    if (userError || !callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized", details: userError?.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = callerUser.id;

    // Service role client for DB operations (including permission checks)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin or super admin
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);

    const roles = (rolesData || []).map((r: any) => r.role);
    const hasPermission = roles.includes("admin") || roles.includes("super_admin");

    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: "Only admins or super admins can change roles" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { user_id, new_role, service_type } = await req.json();

    if (!user_id || !new_role) {
      return new Response(
        JSON.stringify({ error: "user_id and new_role are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!VALID_ROLES.includes(new_role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be staff, moderator, or admin" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate service_type for moderator role
    if (new_role === "moderator") {
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

    // Self-demotion check
    if (callerId === user_id && new_role !== "admin") {
      return new Response(
        JSON.stringify({ error: "You cannot demote yourself" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Delete existing non-user roles for this user
    const { error: deleteError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", user_id)
      .neq("role", "user");

    if (deleteError) {
      throw new Error(`Failed to remove old role: ${deleteError.message}`);
    }

    // Insert new role
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id, role: new_role });

    if (insertError) {
      throw new Error(`Failed to assign new role: ${insertError.message}`);
    }

    // Handle moderator_services
    // Always clean up old moderator_services record
    await supabase
      .from("moderator_services")
      .delete()
      .eq("user_id", user_id);

    // Insert new moderator_services record if new role is moderator
    if (new_role === "moderator" && service_type) {
      const { error: serviceError } = await supabase
        .from("moderator_services")
        .insert({ user_id, service_type });

      if (serviceError) {
        throw new Error(`Failed to assign service type: ${serviceError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, new_role }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
