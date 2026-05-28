
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Attraction } from '@/features/types/supabaseTypes';

export const useAttractions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentAttraction, setCurrentAttraction] = useState<Attraction | null>(null);
  const [formData, setFormDataState] = useState<Omit<Attraction, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    image: '',
    distance: '',
    opening_hours: ''
  });
  
  // Custom implementation to handle Partial<Attraction> input
  const setFormData = (data: Partial<Attraction>) => {
    setFormDataState(prev => ({
      ...prev,
      ...data
    }));
  };
  
  const { data: attractions, isLoading } = useQuery<Attraction[]>({
    queryKey: ['attractions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
  
  const addMutation = useMutation({
    mutationFn: async (newAttraction: Omit<Attraction, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('attractions')
        .insert(newAttraction)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
      resetForm();
      toast({
        title: "Attraction Added",
        description: "The attraction has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add attraction: ${error.message}`
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async (attraction: Attraction) => {
      const { data, error } = await supabase
        .from('attractions')
        .update({
          name: attraction.name,
          description: attraction.description,
          image: attraction.image,
          distance: attraction.distance,
          opening_hours: attraction.opening_hours
        })
        .eq('id', attraction.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
      resetForm();
      toast({
        title: "Attraction Updated",
        description: "The attraction has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update attraction: ${error.message}`
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('attractions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
      toast({
        title: "Attraction Deleted",
        description: "The attraction has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete attraction: ${error.message}`
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.image) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    if (isEditing && currentAttraction) {
      updateMutation.mutate({
        id: currentAttraction.id,
        ...formData
      } as Attraction);
    } else {
      addMutation.mutate(formData);
    }
  };
  
  const handleEdit = (attraction: Attraction) => {
    setIsEditing(true);
    setCurrentAttraction(attraction);
    setFormDataState({
      name: attraction.name,
      description: attraction.description,
      image: attraction.image,
      distance: attraction.distance,
      opening_hours: attraction.opening_hours
    });
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this attraction?")) {
      deleteMutation.mutate(id);
    }
  };
  
  const resetForm = () => {
    setIsEditing(false);
    setCurrentAttraction(null);
    setFormDataState({
      name: '',
      description: '',
      image: '',
      distance: '',
      opening_hours: ''
    });
  };

  return {
    attractions,
    isLoading,
    formData,
    isEditing,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    setFormData
  };
};
