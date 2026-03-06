
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { useTableReservations } from '@/hooks/useTableReservations';
import { useSpaBookings } from '@/hooks/useSpaBookings';
import { useEventReservations } from '@/hooks/useEventReservations';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { NotificationItem } from '@/types/notification';
import { useNotificationsState } from './notifications/useNotificationsState';
import { useNotificationsRealtime } from './notifications/useNotificationsRealtime';
import { combineAndSortNotifications } from './notifications/notificationUtils';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Notification as UnifiedNotification } from '@/types/notifications';
import { supabase } from '@/integrations/supabase/client';

export const useNotifications = () => {
  const { user, userData } = useAuth();
  const userId = user?.id || localStorage.getItem('user_id');
  const userEmail = user?.email || localStorage.getItem('user_email');
  const userRoomNumber = userData?.room_number || localStorage.getItem('user_room_number');

  // Get service requests, table reservations and spa bookings
  const { data: serviceRequests = [], refetch: refetchServices } = useServiceRequests();
  const { reservations = [], refetch: refetchReservations } = useTableReservations();
  const { bookings: spaBookings = [], refetch: refetchSpaBookings } = useSpaBookings();
  const { reservations: eventReservations = [], refetch: refetchEventReservations } = useEventReservations();

  // Unified notifications state
  const [unifiedNotifications, setUnifiedNotifications] = useState<UnifiedNotification[]>([]);

  const refetchUnified = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnifiedNotifications(data as unknown as UnifiedNotification[]);
    } catch (err) {
      console.error("Error refetching unified notifications:", err);
    }
  }, [userId]);

  // Get notification state management with timestamp tracking
  const {
    hasNewNotifications,
    setHasNewNotifications,
    newNotificationCount,
    lastSeenAt,
    markAsSeen
  } = useNotificationsState();

  // Store email in localStorage for future reference
  useEffect(() => {
    if (user?.email && !localStorage.getItem('user_email')) {
      localStorage.setItem('user_email', user.email);
    }
  }, [user?.email]);

  // Force a reload only once on mount to avoid excessive refetching
  useEffect(() => {
    const fetchInitialData = async () => {
      // Use Promise.all to fetch all data in parallel
      await Promise.all([
        refetchServices(),
        refetchReservations(),
        refetchSpaBookings(),
        refetchEventReservations(),
        refetchUnified()
      ]);
    };

    fetchInitialData();
  }, [refetchServices, refetchReservations, refetchSpaBookings, refetchEventReservations, refetchUnified]);

  // Set up real-time notification listeners
  useNotificationsRealtime(
    userId,
    userEmail,
    userRoomNumber,
    refetchReservations,
    refetchServices,
    refetchSpaBookings,
    refetchEventReservations,
    refetchUnified,
    setHasNewNotifications
  );

  // Combine and sort notifications
  const notifications: NotificationItem[] = combineAndSortNotifications(
    serviceRequests,
    reservations,
    spaBookings,
    eventReservations
  );

  // Count unread notifications (those created after lastSeenAt)
  const unreadCount = useMemo(() => {
    // If we have a counter from realtime events, use that
    if (newNotificationCount > 0) {
      return newNotificationCount;
    }
    // Otherwise count notifications updated after lastSeenAt
    const lastSeenDate = new Date(lastSeenAt);

    // Count legacy unreads
    const legacyUnreadCount = notifications.filter(n => {
      const notificationDate = n.time instanceof Date ? n.time : new Date(n.time);
      return notificationDate > lastSeenDate &&
        (n.status === 'pending' || n.status === 'in_progress' || n.status === 'confirmed');
    }).length;

    // Count unified unreads (status !== 'read')
    const unifiedUnreadCount = unifiedNotifications.filter(n => n.status !== 'read').length;

    return legacyUnreadCount + unifiedUnreadCount;
  }, [notifications, unifiedNotifications, lastSeenAt, newNotificationCount]);

  const isAuthenticated = Boolean(userId);

  return {
    notifications,
    unreadCount,
    isAuthenticated,
    hasNewNotifications,
    setHasNewNotifications,
    markAsSeen,
    refetchUnified,
    refetchServices,
    refetchReservations,
    refetchSpaBookings,
    refetchEventReservations
  };
};
