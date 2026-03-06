-- Fix RLS for notifications table to allow client-side inserts and status updates
-- Date: 2026-03-06

-- 1. Ensure RLS is enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Add INSERT policy (Allow system/app to create notifications)
-- Since notifications are triggered by guest/staff actions on the client, 
-- we allow insertion for authenticated and anon roles for now.
DROP POLICY IF EXISTS "Allow system to insert notifications" ON public.notifications;
CREATE POLICY "Allow system to insert notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (true);

-- 3. Add UPDATE policy (Allow marking as read)
-- Users can update notifications where they are the recipient
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE
    USING (
        (recipient_type = 'guest' AND recipient_id IN (
            SELECT id FROM public.guests WHERE user_id = auth.uid()
        ))
        OR
        (recipient_type = 'staff' AND recipient_id = auth.uid())
    )
    WITH CHECK (
        status = 'read' OR status = 'cancelled'
    );

-- 4. Ensure Permissions are granted
GRANT ALL ON public.notifications TO anon;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
