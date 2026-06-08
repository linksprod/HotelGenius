
import { Restaurant } from '@/features/dining/types';

/**
 * Converts a restaurant database row to the Restaurant type
 * @param dbRestaurant The restaurant data from the database
 * @returns Restaurant object with camelCase properties
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapDbRestaurantToRestaurant = (dbRestaurant: any): Restaurant => {
  return {
    id: dbRestaurant.id,
    name: dbRestaurant.name,
    description: dbRestaurant.description,
    cuisine: dbRestaurant.cuisine,
    images: dbRestaurant.images,
    openHours: dbRestaurant.open_hours,
    location: dbRestaurant.location,
    status: dbRestaurant.status as 'open' | 'closed',
    actionText: dbRestaurant.action_text || "Book a Table",
    isFeatured: dbRestaurant.is_featured || false
  };
};

/**
 * Converts a collection of restaurant database rows to an array of Restaurant objects
 * @param dbRestaurants The restaurant data from the database
 * @returns Array of Restaurant objects with camelCase properties
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapDbRestaurantsToRestaurants = (dbRestaurants: any[]): Restaurant[] => {
  return dbRestaurants.map(mapDbRestaurantToRestaurant);
};
