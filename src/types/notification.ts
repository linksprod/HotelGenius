// Type définitions for notifications
export interface NotificationItem {
  id: string;
  type: 'request' | 'reservation' | 'spa_booking' | 'general' | 'event_reservation';
  title: string;
  description: string;
  icon: string;
  status: string;
  time: Date;
  link: string;
  data?: {
    room_number?: string;
    service_type?: string;
    description?: string;
    date?: string;
    time?: string;
    guests?: number;
    restaurant_id?: string;
    service_id?: string;
    event_id?: string;
    special_requests?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

// Type definitions for spa bookings in notifications
export interface SpaBooking {
  id: string;
  service_id: string;
  facility_id: string;
  user_id: string;
  date: string;
  time: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  room_number?: string;
  special_requests?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

// Type definitions for table reservations in notifications 
export interface TableReservation {
  id: string;
  restaurant_id: string;
  date: string;
  time: string;
  guests: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  room_number?: string;
  special_requests?: string;
  status: string;
  created_at: string;
}

// Type definitions for service requests in notifications
export interface ServiceRequest {
  id: string;
  type: string;
  description?: string;
  room_number?: string;
  status: string;
  created_at: string;
}

// Type definitions for event reservations in notifications
export interface EventReservation {
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
}
