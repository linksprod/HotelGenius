import { v4 as uuidv4 } from 'uuid';

export interface UserData {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  room_number: string;
  birth_date?: Date | string; // Accept both Date and string
  nationality?: string;
  check_in_date?: Date | string; // Accept both Date and string
  check_out_date?: Date | string; // Accept both Date and string
  profile_image?: string;
  phone?: string; // Added phone property
  companions?: CompanionData[];
  guest_type?: string;
  hotel_id?: string;
}

export interface CompanionData {
  id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  relation: string;
  birthDate?: Date | string; // Accept both Date and string
  // These are kept for backward compatibility
  firstName?: string;
  lastName?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export interface RoomData {
  room_number: string;
  type: string;
  floor: number;
  status: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
}

export interface GuestData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  room_number: string;
  check_in_date?: string;
  check_out_date?: string;
  birth_date?: string;
  nationality?: string;
  guest_type?: string;
  status?: string;
  profile_image?: string;
  phone?: string;
}

export const generateUserId = (): string => {
  return uuidv4();
};
