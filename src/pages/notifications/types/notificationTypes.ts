
// Types pour les notifications

export interface NotificationItem {
  id: string;
  type: 'request' | 'reservation' | 'spa_booking' | 'general' | 'event_reservation';
  title: string;
  description: string;
  status: string;
  time: Date;
  link: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export interface TableReservation {
  id: string;
  restaurant_id: string;
  date: string;
  time: string;
  guests: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  room_number?: string;
  special_requests?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceRequest {
  id: string;
  type: string;
  description?: string;
  status: 'pending' | 'on_hold' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  room_number?: string;
  guest_name?: string;
  category_id?: string;
}

export interface SpaBooking {
  id: string;
  service_id: string;
  facility_id?: string;
  user_id?: string;
  date: string;
  time: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  room_number?: string;
  special_requests?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventReservationNotification {
  id: string;
  event_id: string;
  date: string;
  guests: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  room_number?: string;
  special_requests?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}
