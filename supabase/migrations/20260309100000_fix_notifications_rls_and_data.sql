-- Migration to fix staff notification visibility and add data column
-- Date: 2026-03-09

-- 1. Add data column to notifications for structured metadata
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

-- 2. Drop existing restrictive select policy
DROP POLICY IF EXISTS "Guests can see their own notifications" ON public.notifications;

-- 3. Create new improved SELECT policy
CREATE POLICY "Notification visibility primary policy" ON public.notifications
    FOR SELECT
    USING (
        -- Guest can see their own notifications
        (recipient_type = 'guest' AND recipient_id IN (
            SELECT id FROM public.guests WHERE user_id = auth.uid()
        ))
        OR
        -- Staff can see notifications addressed to them
        (recipient_type = 'staff' AND recipient_id = auth.uid())
        OR
        -- Staff can see broadcast staff notifications (dummy ID)
        (recipient_type = 'staff' AND recipient_id = '00000000-0000-0000-0000-000000000000' AND EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin', 'manager')
        ))
    );

-- 4. Add INSERT policy for authenticated users (Guests/Staff)
-- This allows the client-side services to trigger notifications
CREATE POLICY "Authenticated users can create notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Add UPDATE policy for recipients (marking as read)
CREATE POLICY "Recipients can update their own notifications" ON public.notifications
    FOR UPDATE
    USING (
        (recipient_type = 'guest' AND recipient_id IN (
            SELECT id FROM public.guests WHERE user_id = auth.uid()
        ))
        OR
        (recipient_type = 'staff' AND recipient_id = auth.uid())
        OR
        -- Allow staff to mark broadcast notifications as read is tricky since it's global, 
        -- but usually admin UI handles this via a seen table. 
        -- For simplicity, allow staff to update broadcast ones if needed.
        (recipient_type = 'staff' AND recipient_id = '00000000-0000-0000-0000-000000000000' AND EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin', 'manager')
        ))
    )
    WITH CHECK (true);
