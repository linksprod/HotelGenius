-- Migration to fix guest notification inserts and staff visibility
-- Date: 2026-06-18

-- 1. Ensure the schema columns are present
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_by_id UUID DEFAULT auth.uid();

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Guests can see their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Notification visibility primary policy" ON public.notifications;
DROP POLICY IF EXISTS "Recipients can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow system to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

-- 3. Create SELECT policies
-- Guests can see their own notifications
CREATE POLICY "Guests can see their own notifications" ON public.notifications
    FOR SELECT
    USING (
        (recipient_type = 'guest' AND recipient_id IN (
            SELECT id FROM public.guests WHERE user_id = auth.uid()
        ))
    );

-- Staff can see notifications addressed to them or broadcast to all staff
CREATE POLICY "Staff can see staff notifications" ON public.notifications
    FOR SELECT
    USING (
        (recipient_type = 'staff' AND (
            recipient_id = auth.uid() 
            OR 
            (recipient_id = '00000000-0000-0000-0000-000000000000' AND public.is_staff_member(auth.uid()))
        ))
    );

-- Creators can select their own notifications (resolves INSERT ... RETURNING failure)
CREATE POLICY "Creators can see their own notifications" ON public.notifications
    FOR SELECT
    USING (
        auth.uid() = created_by_id
    );

-- 4. Create INSERT policy (Only authenticated users can trigger notifications)
CREATE POLICY "Authenticated users can create notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Create UPDATE policies
CREATE POLICY "Recipients can update their own notifications" ON public.notifications
    FOR UPDATE
    USING (
        (recipient_type = 'guest' AND recipient_id IN (
            SELECT id FROM public.guests WHERE user_id = auth.uid()
        ))
        OR
        (recipient_type = 'staff' AND (
            recipient_id = auth.uid()
            OR
            (recipient_id = '00000000-0000-0000-0000-000000000000' AND public.is_staff_member(auth.uid()))
        ))
        OR
        (auth.uid() = created_by_id)
    )
    WITH CHECK (true);
