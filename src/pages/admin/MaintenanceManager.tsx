
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

  // Find the Maintenance and Technical categories
  const maintenanceCategory = categories.find(cat => cat.name === 'Maintenance');
  const technicalCategory = categories.find(cat => cat.name === 'Technical');

  const createMaintenanceCategories = async () => {
    try {
      let mCat = maintenanceCategory;
      let tCat = technicalCategory;

      if (!maintenanceCategory) {
        mCat = await createCategory.mutateAsync({
          name: 'Maintenance',
          description: 'General repairs and infrastructure',
          is_active: true,
          icon: 'Wrench'
        });
      }
      if (!technicalCategory) {
        tCat = await createCategory.mutateAsync({
          name: 'Technical',
          description: 'Technical equipment and systems',
          is_active: true,
          icon: 'Cpu'
        });
      }
      toast({ title: "Success", description: "Maintenance categories created" });
      return { maintenanceCategory: mCat, technicalCategory: tCat };
    } catch (error) {
      console.error("Error creating categories:", error);
      toast({ title: "Error", description: "Failed to create categories", variant: "destructive" });
    }
  };

  // Get the IDs of both categories
  const categoryIds = [
    maintenanceCategory?.id,
    technicalCategory?.id
  ].filter(Boolean) as string[];

  const handleAddItem = async () => {
    const categoriesList = categories;
    const maintenanceCat = categoriesList.find(cat => cat.name === 'Maintenance');
    const technicalCat = categoriesList.find(cat => cat.name === 'Technical');

    if (!newItem.name) {
      toast({
        title: "Validation Error",
        description: "Item name is required",
        variant: "destructive"
      });
      return;
    }

    if (!newItem.category_id) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }

    try {
      await createItem.mutateAsync({
        ...newItem
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
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance & Technical Items Management</h1>
          <p className="text-sm text-muted-foreground">Manage maintenance items and technical requests</p>
        </div>
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
            getCategoryName={(categoryId) => {
              const category = categories.find(cat => cat.id === categoryId);
              return category?.name || 'Unknown';
            }}
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
            <DialogTitle>Add Maintenance/Technical Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <select
                id="category"
                value={newItem.category_id}
                onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Select Category</option>
                {maintenanceCategory && (
                  <option value={maintenanceCategory.id}>Maintenance</option>
                )}
                {technicalCategory && (
                  <option value={technicalCategory.id}>Technical</option>
                )}
              </select>
            </div>

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
            <DialogTitle>Edit Maintenance/Technical Item</DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
                <select
                  id="edit-category"
                  value={editingItem.category_id}
                  onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                >
                  {maintenanceCategory && (
                    <option value={maintenanceCategory.id}>Maintenance</option>
                  )}
                  {technicalCategory && (
                    <option value={technicalCategory.id}>Technical</option>
                  )}
                </select>
              </div>

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
