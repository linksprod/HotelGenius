export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'event' | 'promo';
  is_featured: boolean;
  location?: string;
  date?: string;
  time?: string;
  recurrence_type?: 'once' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
  capacity?: number;
  price?: number;
  restaurant_id?: string | null;
  spa_facility_id?: string | null;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'event' | 'promo';
  is_active: boolean;
  seen: boolean;
  created_at: string;
  updated_at: string;
  eventId?: string;
}

export interface EventReservation {
  id: string;
  eventId: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  roomNumber?: string;
  date: string;
  guests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  hotelId?: string;
  createdAt: string;
}

export interface CreateEventReservationDTO {
  eventId: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  roomNumber?: string;
  date: string;
  guests: number;
  specialRequests?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  hotelId?: string;
}

export interface UpdateEventReservationStatusDTO {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}
