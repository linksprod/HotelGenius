
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CarRental } from '@/features/types/supabaseTypes';

const initialFormData = {
  name: '',
  description: '',
  website: ''
};

export const useCarRentals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentCarRental, setCurrentCarRental] = useState<CarRental | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  const { data: carRentals, isLoading } = useQuery<CarRental[]>({
    queryKey: ['carRentals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_rentals')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const addMutation = useMutation({
    mutationFn: async (newCarRental: Omit<CarRental, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('car_rentals')
        .insert(newCarRental)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carRentals'] });
      resetForm();
      toast({
        title: "Car Rental Added",
        description: "The car rental service has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add car rental: ${error.message}`
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (carRental: CarRental) => {
      const { data, error } = await supabase
        .from('car_rentals')
        .update({
          name: carRental.name,
          description: carRental.description,
          website: carRental.website
        })
        .eq('id', carRental.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carRentals'] });
      resetForm();
      toast({
        title: "Car Rental Updated",
        description: "The car rental service has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update car rental: ${error.message}`
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('car_rentals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carRentals'] });
      toast({
        title: "Car Rental Deleted",
        description: "The car rental service has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete car rental: ${error.message}`
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    if (isEditing && currentCarRental) {
      updateMutation.mutate({
        id: currentCarRental.id,
        ...formData
      });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (carRental: CarRental) => {
    setIsEditing(true);
    setCurrentCarRental(carRental);
    setFormData({
      name: carRental.name,
      description: carRental.description,
      website: carRental.website || ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this car rental service?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentCarRental(null);
    setFormData(initialFormData);
  };

  return {
    carRentals,
    isLoading,
    formData,
    isEditing,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    setFormData: (data: Partial<CarRental>) => setFormData(prev => ({ ...prev, ...data }))
  };
};
