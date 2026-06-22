import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useUserRole } from '@/hooks/useUserRole';

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
  // Get the hotel ID from the staff user's role — safe, no context dependency
  const { hotelId } = useUserRole();
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    // Fetch from unified notifications table for staff, filtered by hotel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = (supabase as any)
      .from('notifications')
      .select('*')
      .eq('recipient_type', 'staff')
      .or(`recipient_id.eq.${user.id},recipient_id.eq.00000000-0000-0000-0000-000000000000`)
      .order('created_at', { ascending: false })
      .limit(50);

    // Filter by current hotel — each hotel sees only its own notifications
    const finalQuery = hotelId ? query.eq('hotel_id', hotelId) : query;

    const { data } = await finalQuery;

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedNotifs: StaffNotification[] = data.map((n: any) => ({
        id: n.notification_id,
        user_id: n.recipient_id,
        type: n.type,
        title: n.title,
        message: n.body,
        reference_id: n.reference_id,
        reference_type: n.reference_type,
        is_read: n.status === 'read',
        created_at: n.created_at,
        data: n.data
      }));
      setNotifications(mappedNotifs);
      setUnreadCount(mappedNotifs.filter((n) => !n.is_read).length);
    }
  }, [user?.id, hotelId]);

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const n = payload.new as any;
          // Filter in JS: must match user and hotel
          const matchesUser = n.recipient_id === user.id || n.recipient_id === '00000000-0000-0000-0000-000000000000';
          const matchesHotel = !hotelId || n.hotel_id === hotelId;

          if (matchesUser && matchesHotel) {
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
  }, [user?.id, hotelId]);

  const markAsRead = useCallback(async (id: string) => {
    await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseQuery = (supabase as any)
      .from('notifications')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('recipient_type', 'staff')
      .or(`recipient_id.eq.${user.id},recipient_id.eq.00000000-0000-0000-0000-000000000000`)
      .neq('status', 'read');

    // Scope update to current hotel only
    const finalQuery = hotelId ? baseQuery.eq('hotel_id', hotelId) : baseQuery;
    await finalQuery;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [user?.id, hotelId]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
};
