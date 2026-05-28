
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DestinationCategory {
  id: string;
  name: string;
  icon: string;
}

const DestinationsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<DestinationCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: ''
  });
  
  // Fetch destination categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['destinationCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destination_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as DestinationCategory[];
    }
  });
  
  // Add a new category
  const addMutation = useMutation({
    mutationFn: async (newCategory: Omit<DestinationCategory, 'id'>) => {
      const { data, error } = await supabase
        .from('destination_categories')
        .insert(newCategory)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinationCategories'] });
      resetForm();
      toast({
        title: "Category Added",
        description: "The destination category has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add category: ${error.message}`
      });
    }
  });
  
  // Update an existing category
  const updateMutation = useMutation({
    mutationFn: async (category: DestinationCategory) => {
      const { data, error } = await supabase
        .from('destination_categories')
        .update({ name: category.name, icon: category.icon })
        .eq('id', category.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinationCategories'] });
      resetForm();
      toast({
        title: "Category Updated",
        description: "The destination category has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update category: ${error.message}`
      });
    }
  });
  
  // Delete a category
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('destination_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinationCategories'] });
      toast({
        title: "Category Deleted",
        description: "The destination category has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete category: ${error.message}`
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.icon) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    if (isEditing && currentCategory) {
      updateMutation.mutate({
        id: currentCategory.id,
        name: formData.name,
        icon: formData.icon
      });
    } else {
      addMutation.mutate({
        name: formData.name,
        icon: formData.icon
      });
    }
  };
  
  const handleEdit = (category: DestinationCategory) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon
    });
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };
  
  const resetForm = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setFormData({
      name: '',
      icon: ''
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Category Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Landmarks, Cafés, Shopping"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Icon Image
                </label>
                <ImageUpload
                  id="icon-upload"
                  value={formData.icon}
                  onChange={(url) => setFormData({ ...formData, icon: url })}
                  className="mb-4"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {isEditing ? 'Update Category' : 'Add Category'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <h3 className="text-lg font-medium">Destination Categories</h3>
      
      {isLoading ? (
        <p>Loading categories...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.icon && (
                      <img
                        src={category.icon}
                        alt={category.name}
                        className="w-10 h-10 object-contain"
                      />
                    )}
                  </TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No categories found. Add your first category.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default DestinationsTab;
