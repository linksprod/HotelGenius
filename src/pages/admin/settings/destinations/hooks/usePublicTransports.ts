
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PublicTransport } from '@/features/types/supabaseTypes';

const initialFormData = {
  name: '',
  description: '',
  website: ''
};

export const usePublicTransports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransport, setCurrentTransport] = useState<PublicTransport | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  const { data: transports, isLoading } = useQuery<PublicTransport[]>({
    queryKey: ['publicTransport'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_transport')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const addMutation = useMutation({
    mutationFn: async (newTransport: Omit<PublicTransport, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('public_transport')
        .insert(newTransport)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicTransport'] });
      resetForm();
      toast({
        title: "Transport Added",
        description: "The public transport has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add transport: ${error.message}`
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (transport: PublicTransport) => {
      const { data, error } = await supabase
        .from('public_transport')
        .update({
          name: transport.name,
          description: transport.description,
          website: transport.website
        })
        .eq('id', transport.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicTransport'] });
      resetForm();
      toast({
        title: "Transport Updated",
        description: "The public transport has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update transport: ${error.message}`
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('public_transport')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicTransport'] });
      toast({
        title: "Transport Deleted",
        description: "The public transport has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete transport: ${error.message}`
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
    
    if (isEditing && currentTransport) {
      updateMutation.mutate({
        id: currentTransport.id,
        ...formData
      });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (transport: PublicTransport) => {
    setIsEditing(true);
    setCurrentTransport(transport);
    setFormData({
      name: transport.name,
      description: transport.description,
      website: transport.website || ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this public transport?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentTransport(null);
    setFormData(initialFormData);
  };

  return {
    transports,
    isLoading,
    formData,
    isEditing,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    setFormData: (data: Partial<PublicTransport>) => setFormData(prev => ({ ...prev, ...data }))
  };
};
