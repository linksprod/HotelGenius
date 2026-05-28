
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequestItem } from '@/features/rooms/types';

type EditItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: RequestItem | null;
  setEditingItem: (i: RequestItem | null) => void;
  onUpdate: () => void;
};

const EditItemDialog = ({ isOpen, onOpenChange, editingItem, setEditingItem, onUpdate }: EditItemDialogProps) => {
  if (!editingItem) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit IT Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-item-name">Name</Label>
            <Input
              id="edit-item-name"
              placeholder="Item Name"
              value={editingItem.name}
              onChange={e => setEditingItem({ ...editingItem, name: e.target.value } as RequestItem)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-item-description">Description</Label>
            <Input
              id="edit-item-description"
              placeholder="Description"
              value={editingItem.description}
              onChange={e => setEditingItem({ ...editingItem, description: e.target.value } as RequestItem)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
