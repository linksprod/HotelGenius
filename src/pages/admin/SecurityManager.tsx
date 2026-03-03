
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield } from 'lucide-react';
import { useRequestCategories, useCreateRequestItem, useCreateRequestCategory } from '@/hooks/useRequestCategories';
import { RequestItem } from '@/features/rooms/types';
import SecurityItemsTab from './security/SecurityItemsTab';
import SecurityRequestsTab from './security/SecurityRequestsTab';
import AddItemDialog from './security/AddItemDialog';
import EditItemDialog from './security/EditItemDialog';
import { useToast } from '@/hooks/use-toast';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { Badge } from '@/components/ui/badge';


const SecurityManager = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'items');
  const { counts, markSectionSeen } = useAdminNotifications();

  React.useEffect(() => {
    if (activeTab === 'requests') {
      markSectionSeen('security');
    }
  }, [activeTab, markSectionSeen]);

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<RequestItem | null>(null);

  const { toast } = useToast();

  const { categories } = useRequestCategories();
  const createCategory = useCreateRequestCategory();

  // Find the Security category dynamically
  const getSecurityCategory = () => categories.find(cat =>
    cat.name?.toLowerCase().includes('security')
  );

  const securityCategory = getSecurityCategory();

  // Get the category ID
  const categoryIds = securityCategory ? [securityCategory.id] : [];

  const createSecurityCategory = async () => {
    try {
      const result = await createCategory.mutateAsync({
        name: 'Security',
        description: 'Security related requests',
        is_active: true,
        icon: 'Shield',
      });

      toast({
        title: "Success",
        description: "Security category created successfully"
      });

      return result;
    } catch (error) {
      console.error('Error creating security category:', error);
      toast({
        title: "Error",
        description: "Failed to create security category",
        variant: "destructive"
      });
      throw error;
    }
  };

  const openEditDialog = (item: RequestItem) => {
    setEditingItem(item);
    setIsEditItemDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div id="admin-ob-security-header" className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Management</h1>
          <p className="text-sm text-muted-foreground">Manage security items and requests</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            Requests
            {counts.security > 0 && (
              <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                {counts.security}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <SecurityItemsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            openAddItemDialog={() => setIsAddItemDialogOpen(true)}
            openEditDialog={openEditDialog}
            createSecurityCategory={createSecurityCategory}
          />
        </TabsContent>

        <TabsContent value="requests">
          <SecurityRequestsTab categoryIds={categoryIds} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddItemDialog
        isOpen={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
        categoryId={securityCategory?.id || ''}
      />

      <EditItemDialog
        isOpen={isEditItemDialogOpen}
        onOpenChange={setIsEditItemDialogOpen}
        item={editingItem}
      />
    </div>
  );
};

export default SecurityManager;
