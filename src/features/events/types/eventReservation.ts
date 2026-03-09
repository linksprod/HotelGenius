
import { EventReservation as BaseEventReservation, CreateEventReservationDTO, UpdateEventReservationStatusDTO } from '@/types/event';

// Define the Supabase table structure for proper typing
export interface EventReservationRow {
  id: string;
  event_id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  room_number: string | null;
  date: string;  // This is a required field
  guests: number;
  special_requests: string | null;
  status: string;
  hotel_id: string | null;
  created_at: string;
  updated_at: string;
}

// Re-export the types from the main types file for ease of import
export type { BaseEventReservation, CreateEventReservationDTO, UpdateEventReservationStatusDTO };
