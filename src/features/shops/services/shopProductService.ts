
import { supabase } from '@/integrations/supabase/client';
import { ShopProduct, ShopProductFormData } from '@/types/shop';

export const fetchShopProducts = async (shopId?: string, hotelId?: string | null): Promise<ShopProduct[]> => {
  let query: any = supabase
    .from('shop_products')
    .select('*');

  if (shopId) {
    query = query.eq('shop_id', shopId);
  } else if (hotelId) {
    query = query.eq('hotel_id', hotelId);
  } else {
    // If neither shopId nor hotelId, return empty for safety
    return [];
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching shop products:', error);
    throw new Error('Failed to fetch shop products');
  }

  return data as ShopProduct[];
};

export const fetchShopProductById = async (id: string): Promise<ShopProduct | null> => {
  const { data, error } = await supabase
    .from('shop_products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching shop product:', error);
    throw new Error('Failed to fetch shop product');
  }

  return data as ShopProduct;
};

export const createShopProduct = async (product: ShopProductFormData & { hotel_id?: string }): Promise<ShopProduct> => {
  const { data, error } = await supabase
    .from('shop_products')
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error('Error creating shop product:', error);
    throw new Error('Failed to create shop product');
  }

  return data as ShopProduct;
};

export const updateShopProduct = async (id: string, product: ShopProductFormData): Promise<ShopProduct> => {
  const { data, error } = await supabase
    .from('shop_products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating shop product:', error);
    throw new Error('Failed to update shop product');
  }

  return data as ShopProduct;
};

export const deleteShopProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('shop_products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting shop product:', error);
    throw new Error('Failed to delete shop product');
  }
};
