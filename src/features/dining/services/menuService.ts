
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/features/dining/types';

export const fetchMenuItems = async (restaurantId?: string, hotelId?: string | null): Promise<MenuItem[]> => {
  let query: any = supabase
    .from('restaurant_menus')
    .select('*');

  if (hotelId) {
    query = query.eq('hotel_id', hotelId);
  }

  if (restaurantId) {
    query = query.eq('restaurant_id', restaurantId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    restaurantId: item.restaurant_id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    image: item.image,
    isFeatured: item.is_featured || false,
    status: item.status as 'available' | 'unavailable',
    menuPdf: item.menu_pdf || undefined
  }));
};

export const fetchMenuItemById = async (id: string): Promise<MenuItem | null> => {
  const { data, error } = await supabase
    .from('restaurant_menus')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching menu item:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    restaurantId: data.restaurant_id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    image: data.image,
    isFeatured: data.is_featured || false,
    status: data.status as 'available' | 'unavailable',
    menuPdf: data.menu_pdf || undefined
  };
};

export const createMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  console.log('Creating menu item with data:', item);
  console.log('menuPdf present:', !!item.menuPdf);

  if (item.menuPdf) {
    console.log('PDF length:', item.menuPdf.length, 'characters');
    console.log('PDF start:', item.menuPdf.substring(0, 50) + '...');
  }

  const { data, error } = await supabase
    .from('restaurant_menus')
    .insert({
      restaurant_id: item.restaurantId,
      hotel_id: (item as any).hotel_id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      is_featured: item.isFeatured,
      status: item.status,
      menu_pdf: item.menuPdf
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating menu item:', error);
    throw error;
  }

  console.log('Menu item created:', data);

  return {
    id: data.id,
    restaurantId: data.restaurant_id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    image: data.image,
    isFeatured: data.is_featured || false,
    status: data.status as 'available' | 'unavailable',
    menuPdf: data.menu_pdf || undefined
  };
};

export const updateMenuItem = async (item: MenuItem): Promise<MenuItem> => {
  console.log('Updating menu item with data:', item);
  console.log('menuPdf present:', !!item.menuPdf);

  if (item.menuPdf) {
    console.log('PDF length:', item.menuPdf.length, 'characters');
    console.log('PDF start:', item.menuPdf.substring(0, 50) + '...');
  }

  const { data, error } = await supabase
    .from('restaurant_menus')
    .update({
      restaurant_id: item.restaurantId,
      hotel_id: (item as any).hotel_id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      is_featured: item.isFeatured,
      status: item.status,
      menu_pdf: item.menuPdf
    })
    .eq('id', item.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }

  console.log('Menu item updated:', data);

  return {
    id: data.id,
    restaurantId: data.restaurant_id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    image: data.image,
    isFeatured: data.is_featured || false,
    status: data.status as 'available' | 'unavailable',
    menuPdf: data.menu_pdf || undefined
  };
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('restaurant_menus')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};
