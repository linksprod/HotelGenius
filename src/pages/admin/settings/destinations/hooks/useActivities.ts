
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/features/types/supabaseTypes';
import { useToast } from '@/hooks/use-toast';

const initialFormData = {
  name: '',
  description: '',
  image: ''
};

export const useActivities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destination_activities')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const addMutation = useMutation({
    mutationFn: async (newActivity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('destination_activities')
        .insert(newActivity)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      resetForm();
      toast({
        title: "Activity Added",
        description: "The activity has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add activity: ${error.message}`
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (activity: Activity) => {
      const { data, error } = await supabase
        .from('destination_activities')
        .update({
          name: activity.name,
          description: activity.description,
          image: activity.image
        })
        .eq('id', activity.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      resetForm();
      toast({
        title: "Activity Updated",
        description: "The activity has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update activity: ${error.message}`
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('destination_activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast({
        title: "Activity Deleted",
        description: "The activity has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete activity: ${error.message}`
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
    
    if (isEditing && currentActivity) {
      updateMutation.mutate({
        id: currentActivity.id,
        ...formData
      });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (activity: Activity) => {
    setIsEditing(true);
    setCurrentActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description,
      image: activity.image
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentActivity(null);
    setFormData(initialFormData);
  };

  return {
    activities,
    isLoading,
    formData,
    isEditing,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    setFormData: (data: Partial<Activity>) => setFormData(prev => ({ ...prev, ...data }))
  };
};
