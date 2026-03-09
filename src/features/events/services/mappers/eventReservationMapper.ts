
import { EventReservation } from '@/types/event';
import { EventReservationRow } from '../../types/eventReservation';
import { CreateEventReservationDTO } from '@/types/event';

export const mapRowToEventReservation = (row: EventReservationRow): EventReservation => {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id || undefined,
    guestName: row.guest_name || undefined,
    guestEmail: row.guest_email || undefined,
    guestPhone: row.guest_phone || undefined,
    roomNumber: row.room_number || undefined,
    date: row.date,
    guests: row.guests,
    specialRequests: row.special_requests || undefined,
    status: row.status as 'pending' | 'confirmed' | 'cancelled',
    hotelId: row.hotel_id || undefined,
    createdAt: row.created_at
  };
}

export const mapDtoToRow = (
  dto: CreateEventReservationDTO,
  userId?: string | null
): Omit<EventReservationRow, 'id' | 'created_at' | 'updated_at'> => {
  return {
    event_id: dto.eventId,
    user_id: userId || null,
    guest_name: dto.guestName || null,
    guest_email: dto.guestEmail || null,
    guest_phone: dto.guestPhone || null,
    room_number: dto.roomNumber || null,
    date: dto.date,  // Ensure this is always present
    guests: dto.guests,
    special_requests: dto.specialRequests || null,
    status: dto.status || 'pending',
    hotel_id: dto.hotelId || null,
  };
};
