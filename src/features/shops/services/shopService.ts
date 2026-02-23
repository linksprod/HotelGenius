
import { supabase } from '@/integrations/supabase/client';
import { Shop, ShopFormData } from '@/types/shop';

export const fetchShops = async (hotelId: string | null = null, isSuperAdmin: boolean = false): Promise<Shop[]> => {
  if (!hotelId && !isSuperAdmin) {
    return [];
  }

  let query = supabase
    .from('shops')
    .select('*, shop_categories(name)');

  if (hotelId) {
    query = query.eq('hotel_id', hotelId);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching shops:', error);
    throw new Error('Failed to fetch shops');
  }

  return data as Shop[];
};

export const fetchShopById = async (id: string): Promise<Shop | null> => {
  const { data, error } = await supabase
    .from('shops')
    .select('*, shop_categories(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching shop:', error);
    throw new Error('Failed to fetch shop');
  }

  return data as Shop;
};

export const createShop = async (shop: ShopFormData & { hotel_id?: string }): Promise<Shop> => {
  const { data, error } = await supabase
    .from('shops')
    .insert(shop)
    .select()
    .single();

  if (error) {
    console.error('Error creating shop:', error);
    throw new Error('Failed to create shop');
  }

  return data as Shop;
};

export const updateShop = async (id: string, shop: ShopFormData): Promise<Shop> => {
  const { data, error } = await supabase
    .from('shops')
    .update(shop)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating shop:', error);
    throw new Error('Failed to update shop');
  }

  return data as Shop;
};

export const deleteShop = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('shops')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting shop:', error);
    throw new Error('Failed to delete shop');
  }
};
