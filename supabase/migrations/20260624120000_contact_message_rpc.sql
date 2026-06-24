-- ================================================================
-- RPC: submit_contact_message
-- 
-- Purpose: Allow guests (authenticated or anonymous) to submit a 
--          contact form message. Uses SECURITY DEFINER to bypass
--          RLS on conversations/messages tables.
-- ================================================================

CREATE OR REPLACE FUNCTION public.submit_contact_message(
    p_guest_name    TEXT,
    p_guest_email   TEXT,
    p_subject       TEXT DEFAULT NULL,
    p_message       TEXT DEFAULT '',
    p_hotel_id      UUID DEFAULT NULL,
    p_guest_id      UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_conversation_id UUID;
    v_hotel_id UUID := p_hotel_id;
    v_guest_id UUID := COALESCE(p_guest_id, auth.uid());
BEGIN
    -- Validation
    IF p_guest_name IS NULL OR p_guest_email IS NULL THEN
        RAISE EXCEPTION 'Name and email are required.';
    END IF;

    -- Resolve hotel_id if not provided
    IF v_hotel_id IS NULL AND v_guest_id IS NOT NULL THEN
        SELECT hotel_id INTO v_hotel_id 
        FROM public.guests 
        WHERE user_id = v_guest_id 
        LIMIT 1;

        IF v_hotel_id IS NULL THEN
            SELECT hotel_id INTO v_hotel_id 
            FROM public.user_roles 
            WHERE user_id = v_guest_id 
            LIMIT 1;
        END IF;
    END IF;

    IF v_hotel_id IS NULL THEN
        RAISE EXCEPTION 'Cannot determine hotel. Please provide hotel_id.';
    END IF;

    -- 1. Create the conversation
    INSERT INTO public.conversations (
        guest_id,
        guest_name,
        guest_email,
        status,
        current_handler,
        conversation_type,
        hotel_id
    ) VALUES (
        v_guest_id,
        p_guest_name,
        p_guest_email,
        'active',
        'human',
        'concierge',
        v_hotel_id
    )
    RETURNING id INTO v_conversation_id;

    -- 2. Insert the message
    INSERT INTO public.messages (
        conversation_id,
        sender_type,
        sender_name,
        content,
        message_type,
        hotel_id
    ) VALUES (
        v_conversation_id,
        'guest',
        p_guest_name,
        '[Contact Form - Subject: ' || COALESCE(p_subject, 'No Subject') || E'\n\n' || p_message,
        'text',
        v_hotel_id
    );

    RETURN jsonb_build_object(
        'status', 'success',
        'conversation_id', v_conversation_id,
        'message', 'Contact message submitted successfully'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'message', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_contact_message(TEXT, TEXT, TEXT, TEXT, UUID, UUID) TO anon, authenticated;
