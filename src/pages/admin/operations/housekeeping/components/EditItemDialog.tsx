
import React from 'react';
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

type EditItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: RequestItem | null;
  setEditingItem: React.Dispatch<React.SetStateAction<RequestItem | null>>;
  onUpdate: () => Promise<void>;
};

const EditItemDialog = ({
  isOpen,
  onOpenChange,
  editingItem,
  setEditingItem,
  onUpdate,
}: EditItemDialogProps) => {
  const updateItem = useUpdateRequestItem();

  if (!editingItem) return null;

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />}
      <Dialog open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Housekeeping Item</DialogTitle>
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
          <Button onClick={onUpdate} disabled={updateItem.isPending}>
            {updateItem.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default EditItemDialog;
