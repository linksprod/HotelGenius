
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
import { RequestItem } from '@/features/rooms/types';
import { useUpdateRequestItem } from '@/hooks/useRequestCategories';
import { useToast } from '@/hooks/use-toast';

type EditItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: RequestItem | null;
};

const EditItemDialog = ({
  isOpen,
  onOpenChange,
  item
}: EditItemDialogProps) => {
  const { toast } = useToast();
  const updateItem = useUpdateRequestItem();
  const [editingItem, setEditingItem] = useState<RequestItem | null>(item);
  
  // Update local state when item prop changes
  React.useEffect(() => {
    setEditingItem(item);
  }, [item]);

  if (!editingItem) return null;

  const handleUpdate = async () => {
    try {
      if (!editingItem.name.trim()) {
        toast({
          title: "Error",
          description: "Name is required",
          variant: "destructive"
        });
        return;
      }
      
      await updateItem.mutateAsync(editingItem);
      
      toast({
        title: "Success",
        description: "Security item updated successfully"
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating security item:', error);
      toast({
        title: "Error",
        description: "Failed to update security item",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Security Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
            <Input
              id="edit-name"
              value={editingItem.name}
              onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
            <Input
              id="edit-description"
              value={editingItem.description || ''}
              onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={editingItem.is_active}
              onChange={(e) => setEditingItem({...editingItem, is_active: e.target.checked})}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-sm font-medium">Active</label>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleUpdate} disabled={updateItem.isPending}>
            {updateItem.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
