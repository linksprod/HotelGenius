
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NotificationItem } from '@/types/notification';

// Safely create a Date object from a string
export const createSafeDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;

  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date : null;
};

// Format time safely to avoid errors with invalid dates
export const formatTimeAgo = (date: Date | null | undefined): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'recently';
  }

  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'recently';
  }
};

// Helper function to get an icon based on service type
function getServiceIcon(type: string): string {
  return '🔔'; // Simple default icon for all service types
}

// Transform service requests to notifications
export const transformServiceRequests = (requests: any[]): NotificationItem[] => {
  if (!Array.isArray(requests)) return [];

  return requests.map(request => ({
    id: request.id || `req-${Math.random().toString(36).substr(2, 9)}`,
    type: 'request',
    title: 'Service Request',
    description: request.description || 'Hotel service',
    icon: getServiceIcon(request.type),
    status: request.status || 'pending',
    time: createSafeDate(request.created_at) || new Date(),
    link: `/requests/${request.id}`,
    data: {
      room_number: request.room_number,
      service_type: request.type,
      description: request.description
    }
  }));
};

// Transform reservations to notifications
export const transformTableReservations = (reservations: any[]): NotificationItem[] => {
  if (!Array.isArray(reservations)) return [];

  return reservations.map(reservation => ({
    id: reservation.id || `res-${Math.random().toString(36).substr(2, 9)}`,
    type: 'reservation',
    title: 'Restaurant Reservation',
    description: `${reservation.date} at ${reservation.time} - ${reservation.guests} guests`,
    icon: '🍽️',
    status: reservation.status || 'pending',
    time: createSafeDate(reservation.createdAt || reservation.created_at) || new Date(),
    link: `/dining/reservations/${reservation.id}`,
    data: {
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      restaurant_id: reservation.restaurant_id,
      room_number: reservation.room_number,
      special_requests: reservation.special_requests
    }
  }));
};

// Transform spa bookings to notifications
export const transformSpaBookings = (bookings: any[]): NotificationItem[] => {
  if (!Array.isArray(bookings)) return [];

  return bookings.map(booking => ({
    id: booking.id || `spa-${Math.random().toString(36).substr(2, 9)}`,
    type: 'spa_booking',
    title: 'Spa Reservation',
    description: `${booking.date} at ${booking.time}`,
    icon: '💆',
    status: booking.status || 'pending',
    time: createSafeDate(booking.created_at) || new Date(),
    link: `/spa/booking/${booking.id}`,
    data: {
      date: booking.date,
      time: booking.time,
      service_id: booking.service_id,
      room_number: booking.room_number,
      special_requests: booking.special_requests
    }
  }));
};

// Transform event reservations to notifications
export const transformEventReservations = (reservations: any[]): NotificationItem[] => {
  if (!Array.isArray(reservations)) return [];

  return reservations.map(reservation => ({
    id: reservation.id || `event-${Math.random().toString(36).substr(2, 9)}`,
    type: 'event_reservation',
    title: 'Event Reservation',
    description: `${reservation.date} - ${reservation.guests} guest(s)`,
    icon: '📅',
    status: reservation.status || 'pending',
    time: createSafeDate(reservation.createdAt || reservation.created_at) || new Date(),
    link: `/events/${reservation.id}`,
    data: {
      date: reservation.date,
      guests: reservation.guests,
      event_id: reservation.eventId || reservation.event_id,
      room_number: reservation.roomNumber || reservation.room_number,
      special_requests: reservation.specialRequests || reservation.special_requests
    }
  }));
};

// Transform unified notifications from the notifications table
export const transformUnifiedNotifications = (notifications: any[]): NotificationItem[] => {
  if (!Array.isArray(notifications)) return [];

  return notifications.map(n => ({
    id: n.notification_id || n.id,
    type: (n.type === 'spa_booking' ? 'spa_booking' :
      n.type === 'table_reservation' ? 'reservation' :
        n.type === 'service_ticket_created' ? 'request' : 'general') as any,
    title: n.title,
    description: n.body,
    icon: n.type === 'spa_booking' ? '💆' :
      n.type === 'table_reservation' ? '🍽️' :
        n.type === 'service_ticket_created' ? '🔔' : '🔔',
    status: n.status === 'read' ? 'read' : 'pending',
    time: createSafeDate(n.created_at) || new Date(),
    link: n.reference_type === 'SpaBooking' ? `/spa/booking/${n.reference_id}` :
      n.reference_type === 'TableReservation' ? `/dining/reservations/${n.reference_id}` :
        n.reference_type === 'ServiceRequest' ? `/requests/${n.reference_id}` : '#',
    data: n.data || {}
  }));
};

// Combine and sort all notifications
export const combineAndSortNotifications = (
  serviceRequests: any[] = [],
  reservations: any[] = [],
  spaBookings: any[] = [],
  eventReservations: any[] = [],
  unifiedNotifications: any[] = []
): NotificationItem[] => {
  // Transform the different types of notifications
  const requestNotifications = transformServiceRequests(serviceRequests);
  const reservationNotifications = transformTableReservations(reservations);
  const spaNotifications = transformSpaBookings(spaBookings);
  const eventNotifications = transformEventReservations(eventReservations);
  const centralNotifications = transformUnifiedNotifications(unifiedNotifications);

  // Combine all notifications
  const allNotifications = [
    ...requestNotifications,
    ...reservationNotifications,
    ...spaNotifications,
    ...eventNotifications,
    ...centralNotifications
  ];

  // Filter out duplicates based on id or reference_id 
  // (to avoid showing the same thing from legacy and unified)
  const seenIds = new Set();
  const uniqueNotifications = allNotifications.filter(n => {
    // If it's from the unified table, use it preferentially
    // We can use the reference ID to find duplicates from legacy tables
    const refId = n.data?.reference_id || n.id;
    if (seenIds.has(refId)) return false;
    seenIds.add(refId);
    return true;
  });

  // Sort by date, newest first
  return uniqueNotifications.sort((a, b) => {
    const timeA = a.time instanceof Date ? a.time.getTime() : 0;
    const timeB = b.time instanceof Date ? b.time.getTime() : 0;
    return timeB - timeA;
  });
};
