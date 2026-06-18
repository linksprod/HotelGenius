-- Migration to enable Supabase Realtime for the unified notifications table
-- Date: 2026-06-18

-- Add notifications table to the supabase_realtime publication
-- This ensures that insertions and updates are broadcasted to staff/guest clients in real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
