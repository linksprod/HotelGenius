
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/features/dining/types';

/**
 * Creates a new restaurant
 */
export const createRestaurant = async (restaurant: Omit<Restaurant, 'id'>): Promise<Restaurant> => {
  console.log('Creating restaurant with data:', restaurant);

  // Verify required fields
  if (!restaurant.name || !restaurant.description || !restaurant.cuisine ||
    !restaurant.openHours || !restaurant.location || !restaurant.status) {
    throw new Error("Some required fields are missing");
  }

  try {
    // Convert from camelCase to snake_case
    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        name: restaurant.name,
        description: restaurant.description,
        cuisine: restaurant.cuisine,
        images: restaurant.images,
        open_hours: restaurant.openHours,
        location: restaurant.location,
        status: restaurant.status,
        action_text: restaurant.actionText,
        is_featured: restaurant.isFeatured,
        hotel_id: (restaurant as any).hotel_id
      })
      .select();

    if (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned from database after insert');
    }

    console.log('Created restaurant:', data[0]);
    // Convert from snake_case to camelCase for the returned data
    return {
      id: data[0].id,
      name: data[0].name,
      description: data[0].description,
      cuisine: data[0].cuisine,
      images: data[0].images,
      openHours: data[0].open_hours,
      location: data[0].location,
      status: data[0].status as 'open' | 'closed',
      actionText: data[0].action_text || "Book a Table",
      isFeatured: data[0].is_featured || false
    };
  } catch (error) {
    console.error('Error in createRestaurant:', error);
    throw error;
  }
};

/**
 * Updates an existing restaurant
 */
export const updateRestaurant = async (restaurant: Restaurant): Promise<Restaurant> => {
  console.log('Updating restaurant with data:', restaurant);

  // Verify required fields
  if (!restaurant.name || !restaurant.description || !restaurant.cuisine ||
    !restaurant.openHours || !restaurant.location || !restaurant.status) {
    throw new Error("Some required fields are missing");
  }

  try {
    // Convert from camelCase to snake_case
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        name: restaurant.name,
        description: restaurant.description,
        cuisine: restaurant.cuisine,
        images: restaurant.images,
        open_hours: restaurant.openHours,
        location: restaurant.location,
        status: restaurant.status,
        action_text: restaurant.actionText,
        is_featured: restaurant.isFeatured || false
      })
      .eq('id', restaurant.id)
      .select();

    if (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error('No data returned from update');
      // Retrieve updated data directly
      const { data: fetchedData, error: fetchError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurant.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      console.log('Fetched updated restaurant:', fetchedData);
      return {
        id: fetchedData.id,
        name: fetchedData.name,
        description: fetchedData.description,
        cuisine: fetchedData.cuisine,
        images: fetchedData.images,
        openHours: fetchedData.open_hours,
        location: fetchedData.location,
        status: fetchedData.status as 'open' | 'closed',
        actionText: fetchedData.action_text || "Book a Table",
        isFeatured: fetchedData.is_featured || false
      };
    }

    console.log('Updated restaurant:', data[0]);
    // Convert from snake_case to camelCase for the returned data
    return {
      id: data[0].id,
      name: data[0].name,
      description: data[0].description,
      cuisine: data[0].cuisine,
      images: data[0].images,
      openHours: data[0].open_hours,
      location: data[0].location,
      status: data[0].status as 'open' | 'closed',
      actionText: data[0].action_text || "Book a Table",
      isFeatured: data[0].is_featured || false
    };
  } catch (error) {
    console.error('Error in updateRestaurant:', error);
    throw error;
  }
};

/**
 * Deletes a restaurant by its ID
 */
export const deleteRestaurant = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting restaurant:', error);
    throw error;
  }
};
