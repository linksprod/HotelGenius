
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  images: string[];
  openHours: string;
  location: string;
  status: 'open' | 'closed';
  actionText?: string;
  isFeatured?: boolean;
  menuPdf?: string;
}

export interface DiningReservation {
  id: string;
  restaurantId: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isFeatured: boolean;
  status: 'available' | 'unavailable';
  menuPdf?: string;
}

export interface TableReservation {
  id: string;
  restaurantId: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  roomNumber?: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  hotelId?: string;
}

// Add the following DTOs for API communication
export interface CreateTableReservationDTO {
  restaurantId: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  roomNumber?: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  hotelId?: string;
}

export interface UpdateReservationStatusDTO {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}
