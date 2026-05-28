import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useRestaurantMenus } from '@/hooks/useRestaurantMenus';
import { useRestaurants } from '@/hooks/useRestaurants';
import { MenuItem } from '@/features/dining/types';
import { Plus, Store } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MenuItemForm from './menu/MenuItemForm';
import MenuItemsTable from './menu/MenuItemsTable';
import { MenuItemFormValues } from './menu/MenuItemFormSchema';

const RestaurantMenusTab = () => {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | undefined>();
  const { menuItems, isLoading, updateMenuItem, createMenuItem, deleteMenuItem } = useRestaurantMenus(selectedRestaurantId);
  const { restaurants } = useRestaurants();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const restaurant = restaurants?.find(r => r.id === selectedRestaurantId);

  const handleSubmit = async (values: MenuItemFormValues) => {
    if (!selectedRestaurantId) {
      toast.error("Please select a restaurant first.");
      return;
    }
    
    try {
      if (editingItem) {
        await updateMenuItem({
          id: editingItem.id,
          restaurantId: selectedRestaurantId,
          name: values.name,
          description: values.description,
          price: values.price,
          category: values.category,
          image: values.image,
          isFeatured: values.isFeatured,
          status: values.status,
          menuPdf: values.menuPdf,
        });
        toast.success("Menu item updated successfully");
      } else {
        await createMenuItem({
          restaurantId: selectedRestaurantId,
          name: values.name,
          description: values.description,
          price: values.price,
          category: values.category,
          image: values.image,
          isFeatured: values.isFeatured,
          status: values.status,
          menuPdf: values.menuPdf,
        });
        toast.success("Menu item added successfully");
      }
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast.error("There was a problem saving the menu item");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a restaurant" />
          </SelectTrigger>
          <SelectContent>
            {restaurants?.map((restaurant) => (
              <SelectItem key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedRestaurantId && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)}>
                <Plus className="mr-2 h-4 w-4" /> Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
                <DialogDescription>
                  {editingItem 
                    ? "Edit the menu item information." 
                    : "Fill out the form to add a new menu item."}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
                <MenuItemForm 
                  onSubmit={handleSubmit}
                  editingItem={editingItem}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedRestaurantId ? (
        <div className="text-center py-8 space-y-2">
          <Store className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Select a Restaurant</h3>
          <p className="text-muted-foreground">Please choose a restaurant to manage its menu</p>
        </div>
      ) : !restaurant ? (
        <div className="text-center py-8">
          <p className="text-red-500">Restaurant not found</p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{restaurant.name} - Menu</h3>
            <p className="text-muted-foreground">Manage the restaurant's menu items</p>
          </div>
          <MenuItemsTable
            items={menuItems || []}
            isLoading={isLoading}
            onEdit={(item) => {
              setEditingItem(item);
              setIsDialogOpen(true);
            }}
            onDelete={deleteMenuItem}
          />
        </div>
      )}
    </div>
  );
};

export default RestaurantMenusTab;