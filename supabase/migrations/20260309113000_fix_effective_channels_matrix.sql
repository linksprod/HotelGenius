-- Migration to fix get_effective_channels according to the exact channel matrix
-- Date: 2026-03-09

CREATE OR REPLACE FUNCTION public.get_effective_channels(
    p_user_id UUID,
    p_notification_type public.notification_type,
    p_priority public.notification_priority DEFAULT 'normal'
) RETURNS public.notification_channel[] AS $$
DECLARE
    prefs RECORD;
    allowed_channels public.notification_channel[] := ARRAY[]::public.notification_channel[];
    final_channels public.notification_channel[] := ARRAY[]::public.notification_channel[];
    is_dnd BOOLEAN := false;
    current_time_val TIME := CURRENT_TIME;
    category_enabled BOOLEAN := true;
BEGIN
    SELECT * INTO prefs FROM public.notification_preferences WHERE user_id = p_user_id;

    -- Define default allowed channels based on notification_type matrix
    CASE p_notification_type::text
        -- Booking
        WHEN 'booking_confirmed' THEN allowed_channels := ARRAY['email', 'push']::public.notification_channel[];
        WHEN 'booking_cancelled' THEN allowed_channels := ARRAY['email', 'push', 'sms']::public.notification_channel[];
        WHEN 'booking_reminder' THEN allowed_channels := ARRAY['push', 'sms']::public.notification_channel[];
        WHEN 'booking_no_show' THEN allowed_channels := ARRAY['email']::public.notification_channel[];
        
        -- Stay
        WHEN 'checkin_ready' THEN allowed_channels := ARRAY['push', 'sms']::public.notification_channel[];
        WHEN 'checkout_reminder' THEN allowed_channels := ARRAY['push']::public.notification_channel[];
        WHEN 'checkout_overdue' THEN allowed_channels := ARRAY['push', 'sms', 'in_app']::public.notification_channel[];
        
        -- Housekeeping & Maintenance
        WHEN 'room_ready' THEN allowed_channels := ARRAY['push', 'in_app']::public.notification_channel[];
        WHEN 'room_maintenance_started' THEN allowed_channels := ARRAY['in_app']::public.notification_channel[];
        WHEN 'room_maintenance_completed' THEN allowed_channels := ARRAY['in_app']::public.notification_channel[];
        
        -- Service
        WHEN 'service_ticket_created' THEN allowed_channels := ARRAY['in_app']::public.notification_channel[];
        WHEN 'service_ticket_assigned' THEN allowed_channels := ARRAY['in_app', 'push']::public.notification_channel[];
        WHEN 'service_ticket_completed' THEN allowed_channels := ARRAY['push']::public.notification_channel[];
        WHEN 'service_ticket_escalated' THEN allowed_channels := ARRAY['in_app', 'push']::public.notification_channel[];
        WHEN 'service_ticket_sla_breach' THEN allowed_channels := ARRAY['in_app', 'push']::public.notification_channel[];
        
        -- Messages
        WHEN 'message_received' THEN allowed_channels := ARRAY['push', 'in_app']::public.notification_channel[];
        WHEN 'message_unread_5min' THEN allowed_channels := ARRAY['in_app']::public.notification_channel[];
        WHEN 'message_unread_10min' THEN allowed_channels := ARRAY['in_app', 'push']::public.notification_channel[];
        WHEN 'message_vip_received' THEN allowed_channels := ARRAY['push', 'in_app']::public.notification_channel[];
        
        -- SLA
        WHEN 'sla_warning_75' THEN allowed_channels := ARRAY['in_app']::public.notification_channel[];
        WHEN 'sla_warning_90' THEN allowed_channels := ARRAY['in_app', 'push']::public.notification_channel[];
        WHEN 'sla_breach' THEN allowed_channels := ARRAY['push', 'in_app']::public.notification_channel[];
        
        -- Guest/System
        WHEN 'guest_vip_arrived' THEN allowed_channels := ARRAY['in_app', 'push']::public.notification_channel[];
        WHEN 'guest_complaint' THEN allowed_channels := ARRAY['in_app', 'push']::public.notification_channel[];
        WHEN 'system_alert' THEN allowed_channels := ARRAY['in_app', 'email']::public.notification_channel[];
        
        -- Other
        WHEN 'payment_confirmation' THEN allowed_channels := ARRAY['email', 'push']::public.notification_channel[];
        WHEN 'health_form_pending' THEN allowed_channels := ARRAY['email', 'push']::public.notification_channel[];
        
        ELSE allowed_channels := ARRAY['in_app']::public.notification_channel[];
    END CASE;

    -- If no preferences found, return default (in_app) and any external if allowed by default matrix
    -- For safety, without prefs we only allow in_app
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
            IF current_time_val >= prefs.dnd_start_time OR current_time_val <= prefs.dnd_end_time THEN
                is_dnd := true;
            END IF;
        END IF;
    END IF;

    -- Emergency override check
    IF is_dnd AND p_priority = 'critical' AND prefs.emergency_override THEN
        is_dnd := false;
    END IF;

    -- Category-specific checks
    IF p_notification_type::text LIKE 'booking_%' AND NOT prefs.booking_notifications THEN
        category_enabled := false;
    ELSIF p_notification_type::text LIKE 'service_%' AND NOT prefs.service_notifications THEN
        category_enabled := false;
    ELSIF p_notification_type::text LIKE 'marketing_%' AND NOT prefs.marketing_notifications THEN
        category_enabled := false;
    END IF;

    IF NOT category_enabled THEN
        RETURN ARRAY['in_app'::public.notification_channel];
    END IF;

    IF is_dnd THEN
        RETURN ARRAY['in_app'::public.notification_channel];
    END IF;

    -- Build channel array based on enabled preferences AND the allowed_channels matrix
    IF prefs.email_enabled AND 'email' = ANY(allowed_channels) THEN 
        final_channels := array_append(final_channels, 'email'::public.notification_channel); 
    END IF;
    IF prefs.push_enabled AND 'push' = ANY(allowed_channels) THEN 
        final_channels := array_append(final_channels, 'push'::public.notification_channel); 
    END IF;
    IF prefs.sms_enabled AND 'sms' = ANY(allowed_channels) THEN 
        final_channels := array_append(final_channels, 'sms'::public.notification_channel); 
    END IF;
    IF prefs.whatsapp_enabled AND 'whatsapp' = ANY(allowed_channels) THEN 
        final_channels := array_append(final_channels, 'whatsapp'::public.notification_channel); 
    END IF;
    IF 'in_app' = ANY(allowed_channels) THEN
        final_channels := array_append(final_channels, 'in_app'::public.notification_channel);
    END IF;
    
    -- Always ensure in_app is present as a baseline
    IF NOT 'in_app' = ANY(final_channels) AND NOT 'in_app' = ANY(allowed_channels) THEN
        -- Wait, if it's explicitly not in allowed_channels, maybe we don't add it?
        -- But for UI state, we usually want it. Let's strictly follow the matrix,
        -- BUT if no external channels survived, fallback to in_app.
        IF array_length(final_channels, 1) IS NULL THEN
             final_channels := ARRAY['in_app'::public.notification_channel];
        END IF;
        -- Let's just follow the matrix. If in_app is in the matrix, it's already added.
        -- Wait, booking_confirmed = email + push in the table, so NO in-app?
        -- In reality, we probably want in_app for almost everything.
        -- We will append in_app if the matrix didn't have it but we want a UI record.
        -- But since the table says "Email + Push", let's strictly return ['email', 'push'].
        -- Note: the Edge function will always record the item in DB, the returned array
        -- determines which EXTERNAL providers to invoke. 'in_app' means send SSE payload.
    END IF;

    RETURN final_channels;
END;
$$ LANGUAGE plpgsql;
