
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlusCircle, Trash2, Edit, Pencil, Save, Search, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRequestCategories, useCreateRequestItem, useCreateRequestCategory, useUpdateRequestItem } from '@/hooks/useRequestCategories';
import { RequestItem } from '@/features/rooms/types';
import MaintenanceItemsTab from './maintenance/components/MaintenanceItemsTab';
import MaintenanceRequestsTab from './maintenance/components/MaintenanceRequestsTab';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';


const MaintenanceManager = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'items');
  const { markSectionSeen } = useAdminNotifications();

  React.useEffect(() => {
    if (activeTab === 'requests') {
      markSectionSeen('maintenance');
    }
  }, [activeTab, markSectionSeen]);

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category_id: '',
    is_active: true
  });
  const [editingItem, setEditingItem] = useState<RequestItem | null>(null);

  const { toast } = useToast();
  const { categories, allItems, isLoading } = useRequestCategories();

  const createItem = useCreateRequestItem();
  const createCategory = useCreateRequestCategory();
  const updateItem = useUpdateRequestItem();

  // Find the Maintenance category
  const maintenanceCategory = categories.find(cat => cat.name === 'Maintenance');

  const createMaintenanceCategories = async () => {
    try {
      let mCat = maintenanceCategory;

      if (!maintenanceCategory) {
        mCat = await createCategory.mutateAsync({
          name: 'Maintenance',
          description: 'General repairs and infrastructure',
          is_active: true,
          icon: 'Wrench'
        });
      }
      toast({ title: "Success", description: "Maintenance category created" });
      return { maintenanceCategory: mCat };
    } catch (error) {
      console.error("Error creating category:", error);
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
    }
  };

  // Get the IDs of the maintenance category
  const categoryIds = [
    maintenanceCategory?.id
  ].filter(Boolean) as string[];

  const handleAddItem = async () => {
    const categoriesList = categories;
    const maintenanceCat = categoriesList.find(cat => cat.name === 'Maintenance');

    if (!newItem.name) {
      toast({
        title: "Validation Error",
        description: "Item name is required",
        variant: "destructive"
      });
      return;
    }

    const targetCategoryId = maintenanceCat?.id;
    if (!targetCategoryId) {
      toast({
        title: "Error",
        description: "Maintenance category not found. Please initialize it first.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createItem.mutateAsync({
        ...newItem,
        category_id: targetCategoryId
      });

      toast({
        title: "Success",
        description: "Item added successfully"
      });

      setNewItem({
        name: '',
        description: '',
        category_id: '',
        is_active: true
      });

      setIsAddItemDialogOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive"
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      await updateItem.mutateAsync(editingItem);

      toast({
        title: "Success",
        description: "Item updated successfully"
      });

      setIsEditItemDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (item: RequestItem) => {
    setEditingItem(item);
    setIsEditItemDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div id="admin-ob-maintenance-header" className="mb-6">
        <AdminPageHeader
          title="Maintenance Items"
          description="Manage maintenance items and requests"
          icon={<Wrench className="h-5 w-5 text-primary" />}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <MaintenanceItemsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            openAddItemDialog={() => setIsAddItemDialogOpen(true)}
            openEditDialog={openEditDialog}
            categoryIds={categoryIds}
            createMaintenanceCategories={createMaintenanceCategories}
          />
        </TabsContent>

        <TabsContent value="requests">
          <MaintenanceRequestsTab categoryIds={categoryIds} />
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Maintenance Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Air Conditioning Issue"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input
                id="description"
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Report a problem with the room's air conditioning"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddItem} disabled={createItem.isPending}>
              {createItem.isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Maintenance Item</DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                <Input
                  id="edit-description"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingItem.is_active}
                  onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Active</label>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateItem} disabled={updateItem.isPending}>
              {updateItem.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceManager;
