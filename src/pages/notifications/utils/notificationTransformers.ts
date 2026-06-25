
import { 
  NotificationItem, 
  ServiceRequest, 
  TableReservation,
  SpaBooking
} from '../types/notificationTypes';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Helper to safely create Date objects
const createSafeDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  
  // Check if the date is valid
  return !isNaN(date.getTime()) ? date : null;
};

// Transforme une liste de demandes de service en notifications
export const transformServiceRequests = (requests: ServiceRequest[]): NotificationItem[] => {
  if (!Array.isArray(requests)) return [];
  
  return requests.map(request => ({
    id: request.id,
    type: 'request',
    title: `Demande de service: ${request.type || 'Service'}`,
    description: request.description || 'Aucune description fournie',
    status: request.status,
    time: createSafeDate(request.created_at) || new Date(),
    link: `/my-room/request/${request.id}`,
    data: {
      requestId: request.id,
      room_number: request.room_number,
      type: request.type,
      status: request.status,
      category: request.category_id,
    }
  }));
};

// Transforme une liste de réservations de restaurant en notifications
export const transformTableReservations = (reservations: TableReservation[]): NotificationItem[] => {
  if (!Array.isArray(reservations)) return [];
  
  return reservations.map(reservation => {
    const reservationDate = reservation.date ? new Date(reservation.date) : null;
    const formattedDate = reservationDate && !isNaN(reservationDate.getTime()) 
      ? format(reservationDate, 'EEEE d MMMM', { locale: fr })
      : 'Date non définie';
    
    return {
      id: reservation.id,
      type: 'reservation',
      title: `Réservation de restaurant`,
      description: `${formattedDate} à ${reservation.time} - ${reservation.guests} ${reservation.guests > 1 ? 'personnes' : 'personne'}`,
      status: reservation.status,
      time: createSafeDate(reservation.created_at) || new Date(),
      link: `/dining/reservation/${reservation.id}`,
      data: {
        restaurantId: reservation.restaurant_id,
        reservationId: reservation.id,
        status: reservation.status,
        date: reservation.date,
        time: reservation.time,
        room_number: reservation.room_number,
        restaurant_name: reservation.restaurant?.name,
        restaurant_location: reservation.restaurant?.location
      }
    };
  });
};

// Transforme une liste de réservations spa en notifications
export const transformSpaBookings = (bookings: SpaBooking[]): NotificationItem[] => {
  if (!Array.isArray(bookings)) return [];
  
  return bookings.map(booking => {
    const bookingDate = booking.date ? new Date(booking.date) : null;
    const formattedDate = bookingDate && !isNaN(bookingDate.getTime()) 
      ? format(bookingDate, 'EEEE d MMMM', { locale: fr })
      : 'Date non définie';
    
    return {
      id: booking.id,
      type: 'spa_booking',
      title: `Réservation de spa`,
      description: `${formattedDate} à ${booking.time}`,
      status: booking.status,
      time: createSafeDate(booking.created_at) || new Date(),
      link: `/spa/booking/${booking.id}`,
      data: {
        serviceId: booking.service_id,
        bookingId: booking.id,
        status: booking.status,
        date: booking.date,
        time: booking.time,
        room_number: booking.room_number,
      }
    };
  });
};

// Fonction pour combiner et trier toutes les notifications
export const combineAndSortNotifications = (
  serviceRequests: ServiceRequest[] = [], 
  reservations: TableReservation[] = [],
  spaBookings: SpaBooking[] = []
): NotificationItem[] => {
  // Transformer les différents types de notification
  const requestNotifications = transformServiceRequests(serviceRequests);
  const reservationNotifications = transformTableReservations(reservations);
  const spaNotifications = transformSpaBookings(spaBookings);
  
  // Combiner toutes les notifications
  const allNotifications = [
    ...requestNotifications,
    ...reservationNotifications,
    ...spaNotifications
  ];
  
  // Trier par date, les plus récentes d'abord
  return allNotifications.sort((a, b) => {
    // Default timestamps if no valid dates
    const timeA = a.time instanceof Date && !isNaN(a.time.getTime()) ? a.time.getTime() : 0;
    const timeB = b.time instanceof Date && !isNaN(b.time.getTime()) ? b.time.getTime() : 0;
    
    return timeB - timeA;
  });
};
