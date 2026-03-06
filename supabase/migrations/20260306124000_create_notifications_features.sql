-- Migration to expand notification types and add preferences
-- Date: 2026-03-06

-- 1. Update Enums (Adding missing values)
-- PostgreSQL doesn't allow ALTER TYPE ... ADD VALUE if the value already exists, 
-- but these are new values based on the spec.
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'booking_confirmed';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'booking_cancelled';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'booking_reminder';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'booking_no_show';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'checkin_ready';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'checkout_reminder';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'checkout_overdue';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'room_ready';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'room_maintenance_started';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'room_maintenance_completed';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'service_ticket_created';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'service_ticket_assigned';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'service_ticket_completed';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'service_ticket_escalated';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'service_ticket_sla_breach';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'message_received';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'message_unread_5min';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'message_unread_10min';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'message_vip_received';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'sla_warning_75';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'sla_warning_90';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'sla_breach';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'guest_vip_arrived';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'guest_complaint';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'system_alert';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'payment_confirmation';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'health_form_pending';

ALTER TYPE public.notification_channel ADD VALUE IF NOT EXISTS 'whatsapp';

-- 2. Create Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY, -- FK to auth.users or guests(id)
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    whatsapp_enabled BOOLEAN DEFAULT false,
    dnd_enabled BOOLEAN DEFAULT false,
    dnd_start_time TIME DEFAULT '22:00',
    dnd_end_time TIME DEFAULT '08:00',
    language TEXT DEFAULT 'en',
    booking_notifications BOOLEAN DEFAULT true,
    service_notifications BOOLEAN DEFAULT true,
    marketing_notifications BOOLEAN DEFAULT false,
    emergency_override BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add updated_at trigger for preferences
CREATE TRIGGER tr_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable RLS for preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Users can manage their own preferences" ON public.notification_preferences
    FOR ALL
    USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.guests WHERE user_id = auth.uid()));

-- 6. Helper Function to get effective channel for a user/type
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

    IF is_dnd THEN
        RETURN ARRAY['in_app'::public.notification_channel]; -- In-app usually still collects
    END IF;

    -- Check specific categories (very simplified mapping here)
    -- In production, we'd have a more robust mapping of type -> category
    
    IF prefs.email_enabled THEN channels := array_append(channels, 'email'::public.notification_channel); END IF;
    IF prefs.push_enabled THEN channels := array_append(channels, 'push'::public.notification_channel); END IF;
    IF prefs.sms_enabled THEN channels := array_append(channels, 'sms'::public.notification_channel); END IF;
    IF prefs.whatsapp_enabled THEN channels := array_append(channels, 'whatsapp'::public.notification_channel); END IF;
    
    -- Always include in_app for staff/system if not DND
    channels := array_append(channels, 'in_app'::public.notification_channel);

    RETURN channels;
END;
$$ LANGUAGE plpgsql;
