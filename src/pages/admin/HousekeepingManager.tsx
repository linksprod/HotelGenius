import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from 'lucide-react';

import { RequestItem } from '@/features/rooms/types';
import { useRequestCategories, useCreateRequestItem, useCreateRequestCategory, useUpdateRequestItem } from '@/hooks/useRequestCategories';
import { useRequestsData } from '@/hooks/useRequestsData';
import { updateRequestStatus } from '@/features/rooms/controllers/roomService';
import HousekeepingItemsTab from './housekeeping/components/HousekeepingItemsTab';
import HousekeepingRequestsTab from './housekeeping/components/HousekeepingRequestsTab';
import AddItemDialog from './housekeeping/components/AddItemDialog';
import EditItemDialog from './housekeeping/components/EditItemDialog';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';


const HousekeepingManager = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'items');
  const { markSectionSeen } = useAdminNotifications();

  React.useEffect(() => {
    if (activeTab === 'requests') {
      markSectionSeen('housekeeping');
    }
  }, [activeTab, markSectionSeen]);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestsSearchTerm, setRequestsSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category_id: '',
    is_active: true
  });
  const [editingItem, setEditingItem] = useState<RequestItem | null>(null);

  const { toast } = useToast();
  const { categories, isLoading } = useRequestCategories();
  const { requests, handleRefresh } = useRequestsData();

  const createItem = useCreateRequestItem();
  const createCategory = useCreateRequestCategory();
  const updateItem = useUpdateRequestItem();

  // Find the Housekeeping category
  const housekeepingCategory = categories.find(cat => cat.name === 'Housekeeping');

  const createHousekeepingCategory = async () => {
    try {
      const result = await createCategory.mutateAsync({
        name: 'Housekeeping',
        description: 'Room cleaning and amenities',
        is_active: true,
        icon: 'Trash2'
      });
      toast({ title: "Success", description: "Housekeeping category created" });
      return result;
    } catch (error) {
      console.error("Error creating category:", error);
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
      throw error;
    }
  };

  // Filter housekeeping requests
  const housekeepingRequests = requests.filter(
    req => {
      const currentCategory = categories.find(cat => cat.name === 'Housekeeping');
      // Check if the request is related to housekeeping
      const isHousekeeping =
        req.category_id === currentCategory?.id ||
        req.type?.toLowerCase() === 'housekeeping' ||
        (req.request_items && req.request_items.category_id === currentCategory?.id);

      return isHousekeeping;
    }
  );

  const handleAddItem = async () => {
    const currentCategory = categories.find(cat => cat.name === 'Housekeeping');

    if (!currentCategory) {
      toast({
        title: "Error",
        description: "Housekeeping category not found. Please try again in 1 second.",
        variant: "destructive"
      });
      return;
    }

    if (!newItem.name) {
      toast({
        title: "Validation Error",
        description: "Item name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      await createItem.mutateAsync({
        ...newItem,
        category_id: currentCategory.id
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

  const handleUpdateRequestStatus = async (requestId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      await updateRequestStatus(requestId, status);
      handleRefresh();

      toast({
        title: "Success",
        description: `Request marked as ${status}`
      });
    } catch (error) {
      console.error("Error updating request status:", error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6">
      <div id="admin-ob-housekeeping-header" className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Trash2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Housekeeping Management</h1>
          <p className="text-sm text-muted-foreground">Manage housekeeping items and requests</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <HousekeepingItemsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            openAddItemDialog={() => setIsAddItemDialogOpen(true)}
            openEditDialog={openEditDialog}
            createHousekeepingCategory={createHousekeepingCategory}
          />
        </TabsContent>

        <TabsContent value="requests">
          <HousekeepingRequestsTab
            requestsSearchTerm={requestsSearchTerm}
            setRequestsSearchTerm={setRequestsSearchTerm}
            handleUpdateRequestStatus={handleUpdateRequestStatus}
          />
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <AddItemDialog
        isOpen={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
        newItem={newItem}
        setNewItem={setNewItem}
        onAdd={handleAddItem}
      />

      {/* Edit Item Dialog */}
      <EditItemDialog
        isOpen={isEditItemDialogOpen}
        onOpenChange={setIsEditItemDialogOpen}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        onUpdate={handleUpdateItem}
      />
    </div>
  );
};

export default HousekeepingManager;
