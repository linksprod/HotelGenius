import { Tables } from '@/integrations/supabase/types';

export type Guest = Tables<'guests'> & {
  is_vip?: boolean;
  total_stays?: number;
  total_spent?: number;
  gender?: string;
  profile_image?: string;
  ai_summary?: string;
};
export type Room = Tables<'rooms'>;
export type Companion = Tables<'companions'>;
export type ServiceRequest = Tables<'service_requests'>;
export type TableReservation = Tables<'table_reservations'>;
export type SpaBooking = Tables<'spa_bookings'>;
export type EventReservation = Tables<'event_reservations'>;

export type GuestStatus = 'in-house' | 'arrivals' | 'departures' | 'upcoming' | 'past' | null;

export interface GuestDetailData {
  guest: Guest;
  room: Room | null;
  companions: Companion[];
  serviceRequests: ServiceRequest[];
  tableReservations: TableReservation[];
  spaBookings: SpaBooking[];
  eventReservations: EventReservation[];
}
