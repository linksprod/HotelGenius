
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/features/dining/types';

/**
 * Fetches all restaurants from the database for a specific hotel
 */
export const fetchRestaurants = async (hotelId: string | null = null, isSuperAdmin: boolean = false): Promise<Restaurant[]> => {
  if (!hotelId && !isSuperAdmin) {
    return [];
  }

  let query = supabase
    .from('restaurants')
    .select('*');

  if (hotelId) {
    query = query.eq('hotel_id', hotelId);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }

  // Convert from snake_case to camelCase
  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    cuisine: item.cuisine,
    images: item.images,
    openHours: item.open_hours,
    location: item.location,
    status: item.status as 'open' | 'closed',
    actionText: item.action_text || "Book a Table",
    isFeatured: item.is_featured || false
  }));
};
/**
 * Fetches a restaurant by its ID
 */
export const fetchRestaurantById = async (id: string): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching restaurant with id ${id}:`, error);
    throw error;
  }

  // Convert from snake_case to camelCase
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    cuisine: data.cuisine,
    images: data.images,
    openHours: data.open_hours,
    location: data.location,
    status: data.status as 'open' | 'closed',
    actionText: data.action_text || "Book a Table",
    isFeatured: data.is_featured || false
  };
};

/**
 * Fetches featured restaurants from the database for a specific hotel
 */
export const fetchFeaturedRestaurants = async (hotelId: string | null = null, isSuperAdmin: boolean = false): Promise<Restaurant[]> => {
  if (!hotelId && !isSuperAdmin) {
    return [];
  }

  let query = supabase
    .from('restaurants')
    .select('*')
    .eq('is_featured', true);

  if (hotelId) {
    query = query.eq('hotel_id', hotelId);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching featured restaurants:', error);
    throw error;
  }

  // Convert from snake_case to camelCase
  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    cuisine: item.cuisine,
    images: item.images,
    openHours: item.open_hours,
    location: item.location,
    status: item.status as 'open' | 'closed',
    actionText: item.action_text || "Book a Table",
    isFeatured: true
  }));
};
