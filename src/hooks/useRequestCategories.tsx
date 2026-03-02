
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RequestCategory, RequestItem } from '@/features/rooms/types';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

/**
 * Main hook to fetch categories and provide access to mutation functions
 */
export function useRequestCategories() {
  const { hotelId } = useCurrentHotelId();

  // Fetch all categories
  const categoriesQuery = useQuery({
    queryKey: ['requestCategories', hotelId],
    enabled: !!hotelId, // Don't run until we have a hotel context
    queryFn: async () => {
      let query = supabase
        .from('request_categories')
        .select('*');

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error("Error fetching request categories:", error);
        throw error;
      }

      return data as RequestCategory[];
    }
  });

  // Fetch all items
  const itemsQuery = useQuery({
    queryKey: ['requestItems', hotelId],
    queryFn: async () => {
      let query = supabase
        .from('request_items')
        .select('*');

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error("Error fetching request items:", error);
        throw error;
      }

      return data as RequestItem[];
    },
    enabled: !!hotelId && !categoriesQuery.isLoading // Only run after categories are loaded AND hotelId exists
  });

  return {
    categories: categoriesQuery.data || [],
    allItems: itemsQuery.data || [],
    isLoading: categoriesQuery.isLoading || (categoriesQuery.isSuccess && itemsQuery.isLoading),
    isError: categoriesQuery.isError || itemsQuery.isError,
    error: categoriesQuery.error || itemsQuery.error
  };
}

/**
 * Separate hooks for mutations to make them easier to use in different components
 */

export function useCreateRequestCategory() {
  const queryClient = useQueryClient();
  const { hotelId } = useCurrentHotelId();

  return useMutation({
    mutationFn: async (category: Omit<RequestCategory, 'id' | 'created_at' | 'updated_at' | 'hotel_id'>) => {
      const { data, error } = await supabase
        .from('request_categories')
        .insert({
          ...category,
          hotel_id: hotelId
        })
        .select()
        .single();

      if (error) throw error;
      return data as RequestCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestCategories', hotelId] });
    }
  });
}

export function useUpdateRequestCategory() {
  const queryClient = useQueryClient();
  const { hotelId } = useCurrentHotelId();

  return useMutation({
    mutationFn: async (category: RequestCategory) => {
      const { data, error } = await supabase
        .from('request_categories')
        .update({
          ...category,
          hotel_id: hotelId,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestCategories', hotelId] });
    }
  });
}

export function useCreateRequestItem() {
  const queryClient = useQueryClient();
  const { hotelId } = useCurrentHotelId();

  return useMutation({
    mutationFn: async (item: Omit<RequestItem, 'id' | 'created_at' | 'updated_at' | 'hotel_id'>) => {
      const { data, error } = await supabase
        .from('request_items')
        .insert({
          ...item,
          hotel_id: hotelId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestItems', hotelId] });
    }
  });
}

export function useUpdateRequestItem() {
  const queryClient = useQueryClient();
  const { hotelId } = useCurrentHotelId();

  return useMutation({
    mutationFn: async (item: RequestItem) => {
      const { data, error } = await supabase
        .from('request_items')
        .update({
          ...item,
          hotel_id: hotelId,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestItems', hotelId] });
    }
  });
}

export function useDeleteRequestItem() {
  const queryClient = useQueryClient();
  const { hotelId } = useCurrentHotelId();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('request_items')
        .delete()
        .eq('id', itemId)
        .eq('hotel_id', hotelId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestItems', hotelId] });
    }
  });
}

/**
 * Hook to fetch items for a specific category
 */
export function useRequestItems(categoryId?: string) {
  const { hotelId } = useCurrentHotelId();

  return useQuery({
    queryKey: ['requestItems', hotelId, categoryId],
    queryFn: async () => {
      if (!categoryId) return [];

      let query = supabase
        .from('request_items')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true);

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error(`Error fetching items for category ${categoryId}:`, error);
        throw error;
      }

      return data as RequestItem[];
    },
    enabled: !!categoryId
  });
}

/**
 * Utility hook to find the security category specifically
 */
export function useSecurityCategory() {
  const { categories } = useRequestCategories();
  const securityCategory = categories.find(
    (cat) => cat.name?.toLowerCase().includes('secur') || cat.name?.toLowerCase().includes('security')
  );
  return securityCategory;
}
