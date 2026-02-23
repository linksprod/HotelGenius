
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RequestCategory, RequestItem } from '@/features/rooms/types';

import { useUserRole } from '@/hooks/useUserRole';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useLocation } from 'react-router-dom';

// Main hook to fetch categories and provide mutation functions
export function useRequestCategories() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { hotelId: adminHotelId } = useUserRole();
  const { hotelId: guestHotelId } = useHotel();

  const isAdminSection = location.pathname.includes('/admin');
  const hotelId = isAdminSection ? adminHotelId : guestHotelId;

  // Fetch all categories
  const categoriesQuery = useQuery({
    queryKey: ['requestCategories', hotelId],
    queryFn: async () => {
      let query: any = supabase
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
      let query: any = supabase
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
    enabled: !categoriesQuery.isLoading // Only run after categories are loaded
  });

  return {
    categories: categoriesQuery.data || [],
    allItems: itemsQuery.data || [],
    isLoading: categoriesQuery.isLoading || itemsQuery.isLoading
  };
}

// Separate hooks for mutations to make them easier to use
export function useCreateRequestCategory() {
  const queryClient = useQueryClient();
  const { hotelId: adminHotelId } = useUserRole();
  const { hotelId: guestHotelId } = useHotel();
  const location = useLocation();
  const isAdminSection = location.pathname.includes('/admin');
  const hotelId = isAdminSection ? adminHotelId : guestHotelId;

  return useMutation({
    mutationFn: async (newCategory: Omit<RequestCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('request_categories')
        .insert({
          name: newCategory.name,
          description: newCategory.description,
          is_active: newCategory.is_active || true,
          icon: newCategory.icon,
          parent_id: newCategory.parent_id
          // hotel_id set by DB trigger
        })
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

export function useUpdateRequestCategory() {
  const queryClient = useQueryClient();
  const { hotelId: adminHotelId } = useUserRole();
  const { hotelId: guestHotelId } = useHotel();
  const location = useLocation();
  const isAdminSection = location.pathname.includes('/admin');
  const hotelId = isAdminSection ? adminHotelId : guestHotelId;

  return useMutation({
    mutationFn: async (category: RequestCategory) => {
      const { data, error } = await supabase
        .from('request_categories')
        .update({
          name: category.name,
          description: category.description,
          is_active: category.is_active,
          icon: category.icon,
          parent_id: category.parent_id,
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
  const { hotelId: adminHotelId } = useUserRole();
  const { hotelId: guestHotelId } = useHotel();
  const location = useLocation();
  const isAdminSection = location.pathname.includes('/admin');
  const hotelId = isAdminSection ? adminHotelId : guestHotelId;

  return useMutation({
    mutationFn: async (newItem: Omit<RequestItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('request_items')
        .insert({
          name: newItem.name,
          description: newItem.description,
          category_id: newItem.category_id,
          is_active: newItem.is_active || true
          // hotel_id set by DB trigger
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
  const { hotelId: adminHotelId } = useUserRole();
  const { hotelId: guestHotelId } = useHotel();
  const location = useLocation();
  const isAdminSection = location.pathname.includes('/admin');
  const hotelId = isAdminSection ? adminHotelId : guestHotelId;

  return useMutation({
    mutationFn: async (item: RequestItem) => {
      const { data, error } = await supabase
        .from('request_items')
        .update({
          name: item.name,
          description: item.description,
          category_id: item.category_id,
          is_active: item.is_active,
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

// Hook to fetch items for a specific category
export function useRequestItems(categoryId?: string) {
  const { hotelId: adminHotelId } = useUserRole();
  const { hotelId: guestHotelId } = useHotel();
  const location = useLocation();
  const isAdminSection = location.pathname.includes('/admin');
  const hotelId = isAdminSection ? adminHotelId : guestHotelId;

  return useQuery({
    queryKey: ['requestItems', hotelId, categoryId],
    queryFn: async () => {
      if (!categoryId) return [];

      let query: any = supabase
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
    enabled: !!categoryId // Only run when we have a categoryId
  });
}

// Update logic to filter/identify the security category
export function useSecurityCategory() {
  const { categories } = useRequestCategories();
  const securityCategory = categories.find(
    (cat) => cat.name?.toLowerCase().includes('secur') || cat.name?.toLowerCase().includes('security')
  );
  return securityCategory;
}
