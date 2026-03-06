import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to set up realtime listeners for notifications with polling fallback
 */
export const useNotificationsRealtime = (
  userId: string | null | undefined,
  userEmail: string | null | undefined,
  userRoomNumber: string | null | undefined,
  refetchReservations: () => void,
  refetchServices: () => void,
  refetchSpaBookings: () => void,
  refetchEventReservations: () => void,
  refetchUnified: () => void,
  setHasNewNotifications: (value: boolean) => void
) => {
  // Polling fallback with exponential backoff and status change detection
  useEffect(() => {
    if (!userId && !userEmail && !userRoomNumber) return;

    let pollInterval = 5000; // Start at 5 seconds
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;
    let lastPollTimestamp = new Date().toISOString();

    const checkForUpdates = async () => {
      try {
        // Build filter based on available identifiers
        const userFilters: string[] = [];
        if (userId) userFilters.push(`user_id.eq.${userId}`);
        if (userEmail) userFilters.push(`guest_email.eq.${userEmail}`);

        if (userFilters.length === 0) return;

        const filterString = userFilters.join(',');

        // Check for reservation updates since last poll (non-pending = status changed)
        const { count: reservationUpdates } = await supabase
          .from('table_reservations')
          .select('*', { count: 'exact', head: true })
          .or(filterString)
          .gt('updated_at', lastPollTimestamp)
          .neq('status', 'pending');

        // Check for spa booking updates
        const spaFilters: string[] = [];
        if (userId) spaFilters.push(`user_id.eq.${userId}`);
        if (userRoomNumber) spaFilters.push(`room_number.eq.${userRoomNumber}`);

        let spaUpdates = 0;
        if (spaFilters.length > 0) {
          const { count } = await supabase
            .from('spa_bookings')
            .select('*', { count: 'exact', head: true })
            .or(spaFilters.join(','))
            .gt('updated_at', lastPollTimestamp)
            .neq('status', 'pending');
          spaUpdates = count || 0;
        }

        // Check for service request updates
        let serviceUpdates = 0;
        if (userId) {
          const { count } = await supabase
            .from('service_requests')
            .select('*', { count: 'exact', head: true })
            .eq('guest_id', userId)
            .gt('updated_at', lastPollTimestamp)
            .neq('status', 'pending');
          serviceUpdates = count || 0;
        }

        // Check for event reservation updates
        let eventUpdates = 0;
        if (userFilters.length > 0) {
          const { count } = await supabase
            .from('event_reservations')
            .select('*', { count: 'exact', head: true })
            .or(filterString)
            .gt('updated_at', lastPollTimestamp)
            .neq('status', 'pending');
          eventUpdates = count || 0;
        }

        // Check for unified notifications
        let unifiedUpdates = 0;
        if (userId) {
          const { count } = await supabase
            .from('notifications' as any)
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', userId)
            .gt('created_at', lastPollTimestamp)
            .neq('status', 'read');
          unifiedUpdates = count || 0;
        }

        const totalUpdates = (reservationUpdates || 0) + spaUpdates + serviceUpdates + eventUpdates + unifiedUpdates;

        if (totalUpdates > 0) {
          console.log('[NOTIFICATION POLLING] Detected status updates:', {
            reservations: reservationUpdates,
            spa: spaUpdates,
            services: serviceUpdates,
            events: eventUpdates,
            unified: unifiedUpdates
          });
          setHasNewNotifications(true);
        }

        lastPollTimestamp = new Date().toISOString();
      } catch (error) {
        console.error('Polling check error:', error);
      }
    };

    const refetchAll = async () => {
      try {
        await Promise.all([
          refetchReservations(),
          refetchServices(),
          refetchSpaBookings(),
          refetchEventReservations(),
          refetchUnified()
        ]);
      } catch (error) {
        console.error('Notification polling error:', error);
      }
    };

    const poll = async () => {
      if (!isMounted) return;

      await checkForUpdates();
      await refetchAll();

      // Gradually increase interval (max 30 seconds)
      pollInterval = Math.min(pollInterval * 1.5, 30000);

      if (isMounted) {
        timeoutId = setTimeout(poll, pollInterval);
      }
    };

    // Start polling after initial delay
    timeoutId = setTimeout(poll, pollInterval);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId, userEmail, userRoomNumber, refetchReservations, refetchServices, refetchSpaBookings, refetchEventReservations, refetchUnified, setHasNewNotifications]);

  // Set up real-time listeners for notifications
  useEffect(() => {
    if (!userId && !userEmail && !userRoomNumber) {
      console.log("No user ID, email or room number found, not setting up real-time listeners in useNotifications");
      return;
    }

    console.log("useNotifications - Setting up real-time listeners with user ID:", userId, "email:", userEmail, "and room number:", userRoomNumber);

    const channels = [];

    // Listen for reservation updates by user ID or email
    if (userId) {
      const reservationChannel = setupReservationListenerById(userId, refetchReservations, setHasNewNotifications);
      channels.push(reservationChannel);
    }

    if (userEmail) {
      const emailChannel = setupReservationListenerByEmail(userEmail, refetchReservations, setHasNewNotifications);
      channels.push(emailChannel);
    }

    // Listen for service request updates
    if (userId) {
      const serviceChannel = setupServiceRequestListener(userId, refetchServices, setHasNewNotifications);
      channels.push(serviceChannel);
    }

    // Listen for spa booking updates by user ID or room number
    if (userId) {
      const spaUserChannel = setupSpaBookingListenerById(userId, refetchSpaBookings, setHasNewNotifications);
      channels.push(spaUserChannel);
    }

    if (userRoomNumber) {
      const spaRoomChannel = setupSpaBookingListenerByRoom(userRoomNumber, refetchSpaBookings, setHasNewNotifications);
      channels.push(spaRoomChannel);
    }

    // Listen for event reservation updates by user ID or email
    if (userId) {
      const eventUserChannel = setupEventReservationListenerById(userId, refetchEventReservations, setHasNewNotifications);
      channels.push(eventUserChannel);
    }

    if (userEmail) {
      const eventEmailChannel = setupEventReservationListenerByEmail(userEmail, refetchEventReservations, setHasNewNotifications);
      channels.push(eventEmailChannel);
    }

    // Listen for unified notifications
    if (userId) {
      const unifiedChannel = setupUnifiedNotificationListener(userId, refetchUnified, setHasNewNotifications);
      channels.push(unifiedChannel);
    }

    return () => {
      console.log("Cleaning up real-time listeners for notifications");
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userId, userEmail, userRoomNumber, refetchReservations, refetchServices, refetchSpaBookings, refetchEventReservations, refetchUnified, setHasNewNotifications]);
};

/**
 * Set up listener for reservation updates by user ID
 */
const setupReservationListenerById = (
  userId: string,
  refetchReservations: () => void,
  setHasNewNotifications: (value: boolean) => void
) => {
  return supabase
    .channel('notification_reservation_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_reservations',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      console.log('[NOTIFICATION REALTIME] Reservation update by ID:', {
        eventType: payload.eventType,
        oldStatus: (payload.old as any)?.status,
        newStatus: (payload.new as any)?.status
      });
      setHasNewNotifications(true);
      refetchReservations();
      handleReservationStatusChange(payload);
    })
    .subscribe();
};

/**
 * Set up listener for reservation updates by email
 */
const setupReservationListenerByEmail = (
  userEmail: string,
  refetchReservations: () => void,
  setHasNewNotifications: (value: boolean) => void
) => {
  return supabase
    .channel('notification_reservation_email_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_reservations',
      filter: `guest_email=eq.${userEmail}`,
    }, (payload) => {
      console.log('Notification reservation email update received:', payload);
      setHasNewNotifications(true);
      refetchReservations();

      // Show toast for status updates
      handleReservationStatusChange(payload);
    })
    .subscribe();
};

/**
 * Set up listener for service request updates
 */
const setupServiceRequestListener = (
  userId: string,
  refetchServices: () => void,
  setHasNewNotifications: (value: boolean) => void
) => {
  return supabase
    .channel('notification_service_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'service_requests',
      filter: `guest_id=eq.${userId}`,
    }, (payload) => {
      console.log('Notification service update received:', payload);
      setHasNewNotifications(true);
      refetchServices();

      // Show toast for status updates
      handleServiceStatusChange(payload);
    })
    .subscribe();
};

/**
 * Set up listener for spa booking updates by user ID
 */
const setupSpaBookingListenerById = (
  userId: string,
  refetchSpaBookings: () => void,
  setHasNewNotifications: (value: boolean) => void
) => {
  return supabase
    .channel('notification_spa_user_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'spa_bookings',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      console.log('Notification spa booking update received by user ID:', payload);
      setHasNewNotifications(true);
      refetchSpaBookings();

      // Show toast for status updates
      handleSpaBookingStatusChange(payload);
    })
    .subscribe();
};

/**
 * Set up listener for spa booking updates by room number
 */
const setupSpaBookingListenerByRoom = (
  roomNumber: string,
  refetchSpaBookings: () => void,
  setHasNewNotifications: (value: boolean) => void
) => {
  return supabase
    .channel('notification_spa_room_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'spa_bookings',
      filter: `room_number=eq.${roomNumber}`,
    }, (payload) => {
      console.log('Notification spa booking update received by room number:', payload);
      setHasNewNotifications(true);
      refetchSpaBookings();

      // Show toast for status updates
      handleSpaBookingStatusChange(payload);
    })
    .subscribe();
};

/**
 * Set up listener for event reservation updates by user ID
 */
const setupEventReservationListenerById = (
  userId: string,
  refetchEventReservations: () => void,
  setHasNewNotifications: (value: boolean) => void
) => {
  return supabase
    .channel('notification_event_user_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'event_reservations',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      console.log('Notification event reservation update received by user ID:', payload);
      setHasNewNotifications(true);
      refetchEventReservations();

      // Show toast for status updates
      handleEventReservationStatusChange(payload);
    })
    .subscribe();
};

/**
 * Set up listener for event reservation updates by email
 */
const setupEventReservationListenerByEmail = (
  userEmail: string,
  refetchEventReservations: () => void,
  setHasNewNotifications: (value: boolean) => void
) => {
  return supabase
    .channel('notification_event_email_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'event_reservations',
      filter: `guest_email=eq.${userEmail}`,
    }, (payload) => {
      console.log('Notification event reservation email update received:', payload);
      setHasNewNotifications(true);
      refetchEventReservations();

      // Show toast for status updates
      handleEventReservationStatusChange(payload);
    })
    .subscribe();
};

/**
 * Set up listener for unified notifications
 */
const setupUnifiedNotificationListener = (
  userId: string,
  refetchUnified: () => void,
  setHasNewNotifications: (value: boolean) => void
) => {
  return supabase
    .channel('notification_unified_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_id=eq.${userId}`,
    }, (payload) => {
      console.log('[NOTIFICATION REALTIME] Unified notification update received:', payload);
      setHasNewNotifications(true);
      refetchUnified();
    })
    .subscribe();
};

// No-op handlers - toasts removed to prevent duplicates. 
// Direct action handlers (forms/buttons) show the toast instead.
const handleReservationStatusChange = (_payload: any) => { };
const handleServiceStatusChange = (_payload: any) => { };
const handleSpaBookingStatusChange = (_payload: any) => { };
const handleEventReservationStatusChange = (_payload: any) => { };
