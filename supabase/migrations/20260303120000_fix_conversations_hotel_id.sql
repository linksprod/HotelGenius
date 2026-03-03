-- Add hotel_id to conversations IF it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'hotel_id') THEN
        ALTER TABLE conversations ADD COLUMN hotel_id UUID REFERENCES hotels(id);
    END IF;
END $$;

-- BACKFILL hotel_id for existing conversations
-- Pass 1: Match via guests table (most common case)
UPDATE conversations c
SET hotel_id = g.hotel_id
FROM guests g
WHERE c.guest_id = g.user_id
AND c.hotel_id IS NULL;

-- Pass 2: Match via user_roles (fallback for cases where guest entry might be missing)
UPDATE conversations c
SET hotel_id = ur.hotel_id
FROM user_roles ur
WHERE c.guest_id = ur.user_id
AND c.hotel_id IS NULL;

-- DROP conflicting RLS policies (the ones that were too restrictive)
DROP POLICY IF EXISTS "Tenant Isolation Select" ON conversations;
DROP POLICY IF EXISTS "Tenant Isolation Insert" ON conversations;
DROP POLICY IF EXISTS "Tenant Isolation Update" ON conversations;
DROP POLICY IF EXISTS "Tenant Isolation Delete" ON conversations;

-- FIX RLS Policies for Conversations
-- 1. Guests view own conversations
CREATE POLICY "Guests view own conversations"
ON conversations FOR SELECT
USING (auth.uid() = guest_id);

-- 2. Admins view ALL hotel conversations
-- is_admin() check includes hotel_admin roles
CREATE POLICY "Admins view hotel conversations"
ON conversations FOR SELECT
USING (is_admin());

-- 3. Guests create conversations
CREATE POLICY "Guests create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = guest_id);

-- 4. Admins create conversations
CREATE POLICY "Admins create conversations"
ON conversations FOR INSERT
WITH CHECK (is_admin());

-- 5. Guests update own conversations
CREATE POLICY "Guests update own conversations"
ON conversations FOR UPDATE
USING (auth.uid() = guest_id);

-- 6. Admins update conversations
CREATE POLICY "Admins update conversations"
ON conversations FOR UPDATE
USING (is_admin());
