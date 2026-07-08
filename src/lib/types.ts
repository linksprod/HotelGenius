export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  room_number: string;
  floor: number;
  type: string;
  view_type: string | null;
  status: string;
}

export interface ServiceRequest {
  id: string;
  guest_id: string;
  room_id: string;
  type: string;
  description: string | null;
  status: string;
  created_at: string;
}

export interface HotelConfig {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  feedback_hero_image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HotelAbout {
  id: string;
  welcome_title: string;
  welcome_description: string;
  welcome_description_extended: string;
  directory_title: string;
  important_numbers: InfoItem[];
  hotel_policies: InfoItem[];
  facilities: InfoItem[];
  additional_info: InfoItem[];
  features: FeatureItem[];
  mission: string;
  created_at: string;
  updated_at: string;
  hero_image: string;
  hero_title: string;
  hero_subtitle: string;
  has_seminars?: boolean;
  seminar_description?: string;
  seminar_image?: string;
  seminar_services?: SeminarService[];
  seminar_rooms?: SeminarRoom[];
  loyalty_enabled?: boolean;
  loyalty_title?: string;
  loyalty_description?: string;
  loyalty_tiers?: LoyaltyTier[];
  loyalty_benefits?: LoyaltyBenefit[];
}

export interface LoyaltyTier {
  name: string;
  points: string;
}

export interface LoyaltyBenefit {
  name: string;
  values: string[];
}


export interface SeminarService {
  name: string;
  icon: string; // lucide icon name, e.g. 'Wifi', 'Volume2'
}

export interface SeminarRoom {
  name: string;
  surface: number;
  height?: number;
  natural_light: boolean;
  wifi: boolean;
  cap_u_shape?: number;
  cap_classroom?: number;
  cap_theatre?: number;
  cap_banquet?: number;
  cap_cocktail?: number;
  cap_boardroom?: number;
}

export interface InfoItem {
  label: string;
  value: string | number | boolean;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}
