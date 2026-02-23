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

        // Initialize Supabase Client with user's token to verify identity
        const supabaseAuth = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: authHeader } } }
        );

        // Use service role for privileged operations
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Get the caller's user ID from their token
        const { data: { user: callerUser }, error: userError } = await supabaseAuth.auth.getUser();

        if (userError || !callerUser) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const callerId = callerUser.id;

        // Check if caller is super_admin via direct DB query (more reliable than RPC)
        const { data: roleData } = await supabaseAdmin
            .from("user_roles")
            .select("role")
            .eq("user_id", callerId)
            .eq("role", "super_admin")
            .maybeSingle();

        const isSuperAdmin = !!roleData;

        if (!isSuperAdmin) {
            return new Response(JSON.stringify({ error: "Super Admin access required" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { hotelName, hotelSlug, adminEmail, adminPassword, adminFirstName, adminLastName } = await req.json();

        // Validate inputs
        if (!hotelName || !hotelSlug || !adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
            return new Response(
                JSON.stringify({ error: "All fields are required" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // 1. Create Hotel
        const { data: newHotel, error: hotelError } = await supabaseAdmin
            .from('hotels')
            .insert({
                name: hotelName,
                slug: hotelSlug,
                address: 'Default Address' // Placeholder to satisfy constraint
            })
            .select()
            .single();

        if (hotelError) {
            return new Response(JSON.stringify({ error: `Failed to create hotel: ${hotelError.message}` }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log("Hotel created:", newHotel.id);

        // 2. Create Admin User
        const { data: newUser, error: createError } =
            await supabaseAdmin.auth.admin.createUser({
                email: adminEmail,
                password: adminPassword,
                email_confirm: true,
                user_metadata: { first_name: adminFirstName, last_name: adminLastName },
            });

        if (createError) {
            // Rollback hotel creation if user creation fails
            await supabaseAdmin.from('hotels').delete().eq('id', newHotel.id);

            return new Response(JSON.stringify({ error: `Failed to create user: ${createError.message}` }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log("User created:", newUser.user.id);

        // 3. Assign hotel_admin role and link to hotel
        // The trigger might insert 'user' role automatically, we need to clean that up or update it.

        // First, insert the correct role
        const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .insert({
                user_id: newUser.user.id,
                role: 'hotel_admin',
                hotel_id: newHotel.id
            });

        if (roleError) {
            // Rollback user and hotel? (Complex rollback, for now just report error)
            console.error("Failed to assign role:", roleError);
            return new Response(JSON.stringify({ error: `User created but role assignment failed: ${roleError.message}` }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Remove default 'user' role if it exists (from triggers)
        await supabaseAdmin
            .from("user_roles")
            .delete()
            .eq("user_id", newUser.user.id)
            .eq("role", "user");

        // 4. Create Guest Profile (for name display)
        await supabaseAdmin.from("guests").insert({
            user_id: newUser.user.id,
            first_name: adminFirstName,
            last_name: adminLastName,
            email: adminEmail,
            guest_type: "Staff", // Mark as staff/admin type
        });

        return new Response(
            JSON.stringify({ success: true, hotelId: newHotel.id, userId: newUser.user.id }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );

    } catch (err) {
        const error = err as Error;
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
