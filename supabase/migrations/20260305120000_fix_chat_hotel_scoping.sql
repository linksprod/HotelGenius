-- ================================================================
-- FIX: Chat hotel scoping for guest conversations
--
-- Problems:
--   1. auto_set_hotel_id trigger reads user_roles, but guests have
--      no entry there → conversations/messages get hotel_id = NULL.
--   2. Tenant Isolation RLS blocks NULL-scoped rows for everyone.
--
-- Solution:
--   A. Rewrite trigger: fall back to guests.hotel_id when user_roles
--      has no entry (i.e. for regular guests).
--   B. Add guest-specific RLS policies for conversations + messages.
--   C. Back-fill existing NULL-hotel_id rows via the guests table.
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- 0. Ensure hotel_id columns exist (safety check)
-- ────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'hotel_id'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'hotel_id'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
    END IF;
END $$;


-- ────────────────────────────────────────────────────────────────
-- A. Rewrite auto_set_hotel_id to support guests
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.auto_set_hotel_id()
RETURNS TRIGGER AS $$
DECLARE
    v_hotel_id UUID;
BEGIN
    IF NEW.hotel_id IS NOT NULL THEN
        -- Already set by the client, keep it
        RETURN NEW;
    END IF;

    -- 1. Try to resolve from user_roles (admins/staff)
    SELECT hotel_id INTO v_hotel_id
    FROM public.user_roles
    WHERE user_id = auth.uid()
    LIMIT 1;

    IF v_hotel_id IS NOT NULL THEN
        NEW.hotel_id := v_hotel_id;
        RETURN NEW;
    END IF;

    -- 2. Fallback: resolve from guests table (regular guests)
    SELECT hotel_id INTO v_hotel_id
    FROM public.guests
    WHERE user_id = auth.uid()
    LIMIT 1;

    IF v_hotel_id IS NOT NULL THEN
        NEW.hotel_id := v_hotel_id;
        RETURN NEW;
    END IF;

    -- 3. Fallback: if the new row has a guest_id column (conversations),
    --    try resolving via that guest_id
    IF TG_TABLE_NAME = 'conversations' AND NEW.guest_id IS NOT NULL THEN
        SELECT hotel_id INTO v_hotel_id
        FROM public.guests
        WHERE user_id = NEW.guest_id
        LIMIT 1;

        IF v_hotel_id IS NOT NULL THEN
            NEW.hotel_id := v_hotel_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ────────────────────────────────────────────────────────────────
-- B. Guest-owned RLS policies for conversations
-- ────────────────────────────────────────────────────────────────

-- Guests can read their own conversations
DROP POLICY IF EXISTS "Guests can view own conversations" ON public.conversations;
CREATE POLICY "Guests can view own conversations"
ON public.conversations
FOR SELECT
USING (guest_id = auth.uid());

-- Guests can insert their own conversations
DROP POLICY IF EXISTS "Guests can insert own conversations" ON public.conversations;
CREATE POLICY "Guests can insert own conversations"
ON public.conversations
FOR INSERT
WITH CHECK (guest_id = auth.uid());

-- Guests can update their own conversations
DROP POLICY IF EXISTS "Guests can update own conversations" ON public.conversations;
CREATE POLICY "Guests can update own conversations"
ON public.conversations
FOR UPDATE
USING (guest_id = auth.uid());


-- ────────────────────────────────────────────────────────────────
-- B2. Guest-owned RLS policies for messages
--     (messages have no direct guest_id; join via conversations)
-- ────────────────────────────────────────────────────────────────

-- Guests can read messages belonging to their conversations
DROP POLICY IF EXISTS "Guests can view messages in own conversations" ON public.messages;
CREATE POLICY "Guests can view messages in own conversations"
ON public.messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
          AND c.guest_id = auth.uid()
    )
);

-- Guests can insert messages into their own conversations
DROP POLICY IF EXISTS "Guests can insert messages in own conversations" ON public.messages;
CREATE POLICY "Guests can insert messages in own conversations"
ON public.messages
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
          AND c.guest_id = auth.uid()
    )
);


-- ────────────────────────────────────────────────────────────────
-- C. Also update can_access_hotel_data to allow NULL hotel_id rows
--    to be readable by any matching-hotel admin (for back-compat)
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.can_access_hotel_data(row_hotel_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_hotel_id UUID;
    user_role TEXT;
BEGIN
    SELECT ur.role::TEXT, ur.hotel_id INTO user_role, user_hotel_id
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    LIMIT 1;

    -- Not in user_roles → regular guest, handled by guest-specific policies
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Super Admin can access everything
    IF user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Hotel Admin/Staff: allow their hotel rows ONLY (No NULL access to prevent leakage)
    IF user_hotel_id IS NOT NULL AND user_hotel_id = row_hotel_id THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ────────────────────────────────────────────────────────────────
-- D. Back-fill: set hotel_id on existing NULL conversations/messages
--    by joining to the guests table on guest_id / conversation_id
-- ────────────────────────────────────────────────────────────────

-- Back-fill conversations
UPDATE public.conversations conv
SET hotel_id = g.hotel_id
FROM public.guests g
WHERE conv.guest_id = g.user_id
  AND conv.hotel_id IS NULL
  AND g.hotel_id IS NOT NULL;

-- Back-fill messages via their parent conversation
UPDATE public.messages msg
SET hotel_id = conv.hotel_id
FROM public.conversations conv
WHERE msg.conversation_id = conv.id
  AND msg.hotel_id IS NULL
  AND conv.hotel_id IS NOT NULL;
