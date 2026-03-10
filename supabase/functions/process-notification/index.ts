
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { EmailProvider, SMSProvider, PushProvider, WhatsAppProvider } from "./providers/index.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const payload = await req.json();
        const { record, bypass_rpc, forced_channels } = payload;

        if (!record) {
            throw new Error("No record found in payload");
        }

        console.log(`Processing notification: ${record.notification_id || 'manual-trigger'} for ${record.recipient_id}`);

        // 1. Get user preferences and effective channels
        let channels = [];
        if (bypass_rpc && forced_channels) {
            console.log("Bypassing RPC, using forced channels:", forced_channels);
            channels = forced_channels;
        } else {
            const { data, error: channelsError } = await supabaseClient.rpc(
                "get_effective_channels",
                {
                    p_user_id: record.recipient_id,
                    p_notification_type: record.type,
                    p_priority: record.priority || 'normal'
                }
            );

            if (channelsError) {
                console.error("Error fetching effective channels:", channelsError);
                // Fallback to in_app + email if RPC fails
                channels = ["in_app", "email"];
            } else {
                channels = data;
            }
        }

        console.log(`Effective channels for ${record.type}: ${channels?.join(", ") || 'none'}`);

        const results: any[] = [];
        const providers = {
            email: new EmailProvider(supabaseClient),
            sms: new SMSProvider(supabaseClient),
            push: new PushProvider(),
            whatsapp: new WhatsAppProvider(),
            in_app: null, // Basic in-app is handled by the record creation + realtime
        };

        // 2. Dispatch to each channel (except in_app which is already 'pending' in DB)
        for (const channel of channels) {
            if (channel === "in_app") continue;

            const provider = providers[channel as keyof typeof providers];
            if (provider) {
                const result = await provider.send({
                    recipient_id: record.recipient_id,
                    recipient_type: record.recipient_type,
                    title: record.title,
                    body: record.body,
                    metadata: {
                        notification_id: record.notification_id,
                        reference_id: record.reference_id,
                        reference_type: record.reference_type
                    }
                });
                results.push({ channel, ...result });
            }
        }

        // 3. Update notification status based on dispatch results if a valid record exists
        const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (record.notification_id && isUuid(record.notification_id)) {
            const anyFailed = results.some((r: any) => !r.success);
            const finalStatus = anyFailed ? "failed" : "sent";
            const errorMessage = results.filter((r: any) => !r.success).map((r: any) => `${r.channel}: ${r.error}`).join("; ");

            const { error: updateError } = await supabaseClient
                .from("notifications")
                .update({
                    status: finalStatus,
                    sent_at: new Date().toISOString(),
                    error_message: errorMessage || null,
                    retry_count: (record.retry_count || 0) + (anyFailed ? 1 : 0)
                })
                .eq("notification_id", record.notification_id);

            if (updateError) {
                console.error("Error updating notification status:", updateError);
            }
        } else {
            console.log("No valid notification UUID provided, skipping status update.");
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Error in process-notification function:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
