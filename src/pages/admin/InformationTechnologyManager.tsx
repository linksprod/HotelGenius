import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wifi } from 'lucide-react';

import { RequestItem } from '@/features/rooms/types';
import { useRequestCategories, useCreateRequestItem, useCreateRequestCategory, useUpdateRequestItem } from '@/hooks/useRequestCategories';
import { useRequestsData } from '@/hooks/useRequestsData';
import { updateRequestStatus } from '@/features/rooms/controllers/roomService';
import InformationTechnologyItemsTab from './information-technology/components/InformationTechnologyItemsTab';
import InformationTechnologyRequestsTab from './information-technology/components/InformationTechnologyRequestsTab';
import AddItemDialog from './information-technology/components/AddItemDialog';
import EditItemDialog from './information-technology/components/EditItemDialog';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';


const InformationTechnologyManager = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'items');
  const { markSectionSeen } = useAdminNotifications();

  React.useEffect(() => {
    if (activeTab === 'requests') {
      markSectionSeen('information-technology');
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
  const { categories } = useRequestCategories();
  const { requests, handleRefresh } = useRequestsData();
  const createItem = useCreateRequestItem();
  const createCategory = useCreateRequestCategory();
  const updateItem = useUpdateRequestItem();

  const itCategory = categories.find(cat => cat.name === 'Information Technology');

  const createITCategory = async () => {
    try {
      const result = await createCategory.mutateAsync({
        name: 'Information Technology',
        description: 'IT support and technology requests',
        is_active: true,
        icon: 'Wifi'
      });
      toast({ title: "Success", description: "IT Support category created" });
      return result; // Explicitly return the result for immediate ID access
    } catch (error) {
      console.error("Error creating category:", error);
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
      throw error;
    }
  };
  const itRequests = requests.filter(req => {
    const currentCategory = categories.find(cat => cat.name === 'Information Technology');
    return req.category_id === currentCategory?.id
      || req.type?.toLowerCase().includes('information technology')
      || (req.request_items && req.request_items.category_id === currentCategory?.id);
  });

  const handleAddItem = async () => {
    const currentCategory = categories.find(cat => cat.name === 'Information Technology');

    if (!currentCategory) {
      toast({
        title: "Error",
        description: "Information Technology category not found. Please try again in 1 second.",
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
      toast({ title: "Success", description: "Item added successfully" });
      setNewItem({ name: '', description: '', category_id: '', is_active: true });
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
      toast({ title: "Success", description: "Item updated successfully" });
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
        description: `Request marked as ${status.replace('_', ' ')}`
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
      <div id="admin-ob-it-header" className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Wifi className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Information Technology Management</h1>
          <p className="text-sm text-muted-foreground">Manage IT items and support requests</p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <InformationTechnologyItemsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            openAddItemDialog={() => setIsAddItemDialogOpen(true)}
            openEditDialog={openEditDialog}
            createITCategory={createITCategory}
          />
        </TabsContent>
        <TabsContent value="requests">
          <InformationTechnologyRequestsTab
            requestsSearchTerm={requestsSearchTerm}
            setRequestsSearchTerm={setRequestsSearchTerm}
            handleUpdateRequestStatus={handleUpdateRequestStatus}
          />
        </TabsContent>
      </Tabs>
      <AddItemDialog
        isOpen={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
        newItem={newItem}
        setNewItem={setNewItem}
        onAdd={handleAddItem}
      />
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

export default InformationTechnologyManager;
