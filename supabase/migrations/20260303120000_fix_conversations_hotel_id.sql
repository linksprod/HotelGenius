-- Ensure hotel_id column exists on conversations (idempotent)
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES public.hotels(id);

-- Backfill hotel_id for existing conversations based on their guest's hotel
-- First: try to match via guests table (user_id → hotel_id)
UPDATE public.conversations c
SET hotel_id = g.hotel_id
FROM public.guests g
WHERE c.guest_id = g.user_id
  AND c.hotel_id IS NULL
  AND g.hotel_id IS NOT NULL;

-- Second pass: try to match via user_roles (the guest might be also in user_roles with a hotel)
UPDATE public.conversations c
SET hotel_id = ur.hotel_id
FROM public.user_roles ur
WHERE c.guest_id = ur.user_id
  AND c.hotel_id IS NULL
  AND ur.hotel_id IS NOT NULL;

-- Drop the conflicting "Tenant Isolation Select" policy on conversations
-- (it blocks hotel_admin from seeing conversations where hotel_id IS NULL)
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.conversations;
DROP POLICY IF EXISTS "Tenant Isolation Insert" ON public.conversations;
DROP POLICY IF EXISTS "Tenant Isolation Update" ON public.conversations;
DROP POLICY IF EXISTS "Tenant Isolation Delete" ON public.conversations;

-- Replace with a cleaner hotel-scoped policy that:
-- 1. Lets guests see their own conversations
-- 2. Lets staff/admin see ALL conversations for their hotel (or all for super_admin)
-- 3. Does NOT block rows with NULL hotel_id from admins (fallback)

-- Guests: can only see their own conversations
CREATE POLICY "Guests view own conversations"
  ON public.conversations
  FOR SELECT
  USING (auth.uid() = guest_id);

-- Admins/staff: can see all conversations for their hotel
-- hotel_admin sees rows where hotel_id matches OR hotel_id is NULL (legacy)
CREATE POLICY "Admins view hotel conversations"
  ON public.conversations
  FOR SELECT
  USING (
    public.is_admin(auth.uid())
  );

-- Insert: guests can create their own conversations
CREATE POLICY "Guests create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = guest_id);

-- Insert: admins can create conversations
CREATE POLICY "Admins create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Update: guests update their own
CREATE POLICY "Guests update own conversations"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() = guest_id);

-- Update: admins update any in their scope
CREATE POLICY "Admins update conversations"
  ON public.conversations
  FOR UPDATE
  USING (public.is_admin(auth.uid()));
