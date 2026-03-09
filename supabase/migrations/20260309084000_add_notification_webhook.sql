-- Migration to add notification webhook and refine RPC
-- Date: 2026-03-09

-- 1. Refine get_effective_channels to use specific categories
-- (Replacing the previous version with a more robust one)
CREATE OR REPLACE FUNCTION public.get_effective_channels(
    p_user_id UUID,
    p_notification_type public.notification_type,
    p_priority public.notification_priority DEFAULT 'normal'
) RETURNS public.notification_channel[] AS $$
DECLARE
    prefs RECORD;
    channels public.notification_channel[] := ARRAY[]::public.notification_channel[];
    is_dnd BOOLEAN := false;
    current_time_val TIME := CURRENT_TIME;
    category_enabled BOOLEAN := true;
BEGIN
    SELECT * INTO prefs FROM public.notification_preferences WHERE user_id = p_user_id;
    
    -- If no preferences found, return default (in_app)
    IF NOT FOUND THEN
        RETURN ARRAY['in_app'::public.notification_channel];
    END IF;

    -- Check DND
    IF prefs.dnd_enabled THEN
        IF prefs.dnd_start_time <= prefs.dnd_end_time THEN
            IF current_time_val >= prefs.dnd_start_time AND current_time_val <= prefs.dnd_end_time THEN
                is_dnd := true;
            END IF;
        ELSE
            -- DND spans midnight
            IF current_time_val >= prefs.dnd_start_time OR current_time_val <= prefs.dnd_end_time THEN
                is_dnd := true;
            END IF;
        END IF;
    END IF;

    -- Emergency override check
    IF is_dnd AND p_priority = 'critical' AND prefs.emergency_override THEN
        is_dnd := false;
    END IF;

    -- If DND is active, only internal channels (in_app) are allowed
    IF is_dnd THEN
        RETURN ARRAY['in_app'::public.notification_channel];
    END IF;

    -- Category-specific checks
    -- Logic based on notification_type prefix/category
    IF p_notification_type::text LIKE 'booking_%' AND NOT prefs.booking_notifications THEN
        category_enabled := false;
    ELSIF p_notification_type::text LIKE 'service_%' AND NOT prefs.service_notifications THEN
        category_enabled := false;
    ELSIF p_notification_type::text LIKE 'marketing_%' AND NOT prefs.marketing_notifications THEN
        category_enabled := false;
    END IF;

    IF NOT category_enabled THEN
        -- If category is disabled, we still allow in_app for operational awareness
        -- but suppress external channels.
        RETURN ARRAY['in_app'::public.notification_channel];
    END IF;

    -- Build channel array based on enabled preferences
    IF prefs.email_enabled THEN channels := array_append(channels, 'email'::public.notification_channel); END IF;
    IF prefs.push_enabled THEN channels := array_append(channels, 'push'::public.notification_channel); END IF;
    IF prefs.sms_enabled THEN channels := array_append(channels, 'sms'::public.notification_channel); END IF;
    IF prefs.whatsapp_enabled THEN channels := array_append(channels, 'whatsapp'::public.notification_channel); END IF;
    
    -- Always include in_app
    channels := array_append(channels, 'in_app'::public.notification_channel);

    RETURN channels;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the webhook trigger function
-- This calls our Supabase Edge Function
CREATE OR REPLACE FUNCTION public.tr_process_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger for NEW 'pending' notifications
    IF (TG_OP = 'INSERT' AND NEW.status = 'pending') THEN
        PERFORM
            net.http_post(
                url := 'https://' || (SELECT value FROM metadata.settings WHERE key = 'edge_function_host') || '.functions.supabase.co/process-notification',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || (SELECT value FROM metadata.settings WHERE key = 'service_role_key')
                ),
                body := jsonb_build_object('record', row_to_json(NEW))
            );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach the trigger to notifications table
DROP TRIGGER IF EXISTS tr_notifications_process ON public.notifications;
CREATE TRIGGER tr_notifications_process
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.tr_process_notification();

-- NOTE: The above trigger requires pg_net extension to be enabled and 
-- metadata.settings (or similar) to exist for dynamic URLs.
-- For a standard Supabase setup, we usually use the built-in Database Webhooks UI
-- but this SQL provides the logic.
