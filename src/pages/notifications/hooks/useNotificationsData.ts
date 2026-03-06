
import { useEffect, useState } from 'react';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { useTableReservations } from '@/hooks/useTableReservations';
import { useSpaBookings } from '@/hooks/useSpaBookings';
import { NotificationItem, SpaBooking as NotificationSpaBooking } from '../types/notificationTypes';
import { useUserAuthentication } from './useUserAuthentication';
import { combineAndSortNotifications } from '../utils/notificationTransformers';
import { SpaBooking as FeatureSpaBooking } from '@/features/spa/types';
import { Notification as UnifiedNotification } from '@/types/notifications';
import { supabase } from '@/integrations/supabase/client';

export const useNotificationsData = () => {
  // Get user authentication data
  const { userId, userEmail, userRoomNumber, isAuthenticated } = useUserAuthentication();

  // Get service requests
  const {
    data: serviceRequests = [],
    isLoading: isLoadingRequests,
    isError: isServiceRequestsError
  } = useServiceRequests();

  // Get table reservations
  const {
    reservations = [],
    isLoading: isLoadingReservations,
    error: reservationsError
  } = useTableReservations();

  // Get spa bookings
  const {
    bookings: spaBookingsData = [],
    isLoading: isLoadingSpaBookings,
    error: spaBookingsError,
    fetchUserBookings
  } = useSpaBookings();

  // State for notifications and errors
  const [unifiedNotifications, setUnifiedNotifications] = useState<UnifiedNotification[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userSpaBookings, setUserSpaBookings] = useState<NotificationSpaBooking[]>([]);
  const [combinedError, setCombinedError] = useState<boolean>(false);
  const [isLoadingUnified, setIsLoadingUnified] = useState<boolean>(false);

  // Fetch user spa bookings when userId is available
  useEffect(() => {
    const loadUserSpaBookings = async () => {
      if (!userId && !userEmail) return;

      try {
        if (userId) {
          const bookings = await fetchUserBookings(userId);

          // Convert from feature type to notification type
          const convertedBookings: NotificationSpaBooking[] = bookings.map(booking => ({
            id: booking.id,
            service_id: booking.service_id,
            facility_id: booking.facility_id,
            user_id: booking.user_id,
            date: booking.date,
            time: booking.time,
            guest_name: booking.guest_name,
            guest_email: booking.guest_email,
            guest_phone: booking.guest_phone,
            room_number: booking.room_number,
            special_requests: booking.special_requests,
            status: booking.status,
            created_at: booking.created_at,
            updated_at: booking.updated_at
          }));

          setUserSpaBookings(convertedBookings);
        }
      } catch (error) {
        console.error("Error fetching user spa bookings:", error);
      }
    };

    loadUserSpaBookings();
  }, [userId, userEmail, fetchUserBookings]);

  // Fetch unified notifications
  const fetchUnified = async () => {
    if (!userId) return;
    setIsLoadingUnified(true);
    try {
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnifiedNotifications(data as unknown as UnifiedNotification[]);
    } catch (err) {
      console.error("Error fetching unified notifications:", err);
    } finally {
      setIsLoadingUnified(false);
    }
  };

  useEffect(() => {
    fetchUnified();
  }, [userId]);

  // Debug logs
  useEffect(() => {
    console.log("Data sources:", {
      serviceRequests: serviceRequests?.length || 0,
      reservations: reservations?.length || 0,
      spaBookings: userSpaBookings?.length || 0,
      isLoadingRequests,
      isLoadingReservations,
      isLoadingSpaBookings,
      hasServiceRequestError: isServiceRequestsError,
      hasReservationError: !!reservationsError,
      hasSpaBookingError: !!spaBookingsError
    });
  }, [serviceRequests, reservations, userSpaBookings, isLoadingRequests,
    isLoadingReservations, isLoadingSpaBookings, isServiceRequestsError,
    reservationsError, spaBookingsError]);

  // Create notifications when data changes
  useEffect(() => {
    try {
      // Ensure we have arrays for all data sources
      const safeServiceRequests = Array.isArray(serviceRequests) ? serviceRequests : [];
      const safeReservations = Array.isArray(reservations) ? reservations : [];
      const safeSpaBookings = Array.isArray(userSpaBookings) ? userSpaBookings : [];

      // Convert dining TableReservation to notification TableReservation if needed
      const convertedReservations = safeReservations.map(res => ({
        id: res.id,
        restaurant_id: res.restaurantId || '',
        date: res.date,
        time: res.time,
        guests: res.guests,
        guest_name: res.guestName,
        guest_email: res.guestEmail,
        guest_phone: res.guestPhone,
        room_number: res.roomNumber,
        special_requests: res.specialRequests,
        status: res.status,
        created_at: res.createdAt
      }));

      // Combine and sort legacy notifications
      const legacyNotifications = combineAndSortNotifications(
        safeServiceRequests,
        convertedReservations,
        safeSpaBookings
      );

      // Map unified notifications to the common format
      const mappedUnified: NotificationItem[] = unifiedNotifications.map(n => ({
        id: n.notification_id,
        type: n.type.includes('service') ? 'request' : (n.type.includes('reservation') || n.type.includes('booking')) ? 'reservation' : 'general',
        title: n.title,
        description: n.body,
        status: n.status,
        time: new Date(n.created_at),
        link: n.type.includes('service') ? '/requests' : (n.type.includes('reservation') || n.type.includes('booking')) ? '/dining' : '/notifications',
        data: n
      }));

      // Final merge (Unique by reference_id if possible, or just combined)
      // For now, simple combining and sorting by date
      const finalNotifications = [...mappedUnified, ...legacyNotifications].sort((a, b) => b.time.getTime() - a.time.getTime());

      setNotifications(finalNotifications);
      setCombinedError(false);

      console.log("Combined notifications (Legacy + Unified):", finalNotifications.length);
    } catch (error) {
      console.error("Error combining notifications:", error);
      setNotifications([]);
      setCombinedError(true);
    }
  }, [serviceRequests, reservations, userSpaBookings, unifiedNotifications]);

  const isLoading = isLoadingRequests || isLoadingReservations || isLoadingSpaBookings || isLoadingUnified;
  const error = isServiceRequestsError || reservationsError || spaBookingsError || combinedError;

  return {
    notifications,
    isLoading,
    isAuthenticated,
    userId,
    userEmail,
    userRoomNumber,
    error: error ? true : false,
    refetchUnified: fetchUnified
  };
};
