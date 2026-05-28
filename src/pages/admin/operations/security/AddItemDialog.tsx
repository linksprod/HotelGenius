
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { useCreateRequestItem } from '@/hooks/useRequestCategories';
import { useToast } from '@/hooks/use-toast';

type AddItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
};

const AddItemDialog = ({
  isOpen,
  onOpenChange,
  categoryId
}: AddItemDialogProps) => {
  const { toast } = useToast();
  const createItem = useCreateRequestItem();
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category_id: categoryId,
    is_active: true
  });
  
  const handleAdd = async () => {
    try {
      if (!newItem.name.trim()) {
        toast({
          title: "Error",
          description: "Name is required",
          variant: "destructive"
        });
        return;
      }
      
      await createItem.mutateAsync({
        name: newItem.name,
        description: newItem.description,
        category_id: categoryId,
        is_active: true
      });
      
      toast({
        title: "Success",
        description: "Security item added successfully"
      });
      
      setNewItem({
        name: '',
        description: '',
        category_id: categoryId,
        is_active: true
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding security item:', error);
      toast({
        title: "Error",
        description: "Failed to add security item",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Security Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input
              id="name"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              placeholder="Surveillance Camera"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Input
              id="description"
              value={newItem.description || ''}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              placeholder="Request surveillance camera installation"
            />
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAdd} disabled={createItem.isPending}>
            {createItem.isPending ? 'Adding...' : 'Add Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
