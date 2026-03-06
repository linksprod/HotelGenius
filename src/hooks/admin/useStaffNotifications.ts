import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuthContext';

export interface StaffNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
}

export const useStaffNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    // Fetch from unified notifications table for staff
    const { data } = await supabase
      .from('notifications' as any)
      .select('*')
      .eq('recipient_type', 'staff')
      .or(`recipient_id.eq.${user.id},recipient_id.eq.00000000-0000-0000-0000-000000000000`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      const mappedNotifs: StaffNotification[] = data.map((n: any) => ({
        id: n.notification_id,
        user_id: n.recipient_id,
        type: n.type,
        title: n.title,
        message: n.body,
        reference_id: n.reference_id,
        reference_type: n.reference_type,
        is_read: n.status === 'read',
        created_at: n.created_at
      }));
      setNotifications(mappedNotifs);
      setUnreadCount(mappedNotifs.filter((n) => !n.is_read).length);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('staff-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_type=eq.staff`,
        },
        async (payload) => {
          const n = payload.new as any;
          // Filter in JS since .or filters aren't supported in realtime filter strings yet
          if (n.recipient_id === user.id || n.recipient_id === '00000000-0000-0000-0000-000000000000') {
            const newNotif: StaffNotification = {
              id: n.notification_id,
              user_id: n.recipient_id,
              type: n.type,
              title: n.title,
              message: n.body,
              reference_id: n.reference_id,
              reference_type: n.reference_type,
              is_read: n.status === 'read',
              created_at: n.created_at
            };
            setNotifications((prev) => [newNotif, ...prev]);
            if (!newNotif.is_read) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = useCallback(async (id: string) => {
    await supabase
      .from('notifications' as any)
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('notification_id', id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    await supabase
      .from('notifications' as any)
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('recipient_type', 'staff')
      .or(`recipient_id.eq.${user.id},recipient_id.eq.00000000-0000-0000-0000-000000000000`)
      .neq('status', 'read');

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [user?.id]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
};
