
import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useRestaurantMenus } from '@/hooks/useRestaurantMenus';
import { useRestaurants } from '@/hooks/useRestaurants';
import { MenuItem } from '@/features/dining/types';
import { Plus, ArrowLeft, Store } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MenuItemForm from './restaurants/menu/MenuItemForm';
import MenuItemsTable from './restaurants/menu/MenuItemsTable';
import { MenuItemFormValues } from './restaurants/menu/MenuItemFormSchema';
import { useHotelPath } from '@/hooks/useHotelPath';

const RestaurantMenuManager = () => {
  const { resolvePath } = useHotelPath();
  const [searchParams, setSearchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  const { menuItems, isLoading, updateMenuItem, createMenuItem, deleteMenuItem } = useRestaurantMenus(restaurantId || undefined);
  const { restaurants, isLoading: isLoadingRestaurants } = useRestaurants();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const restaurant = restaurants?.find(r => r.id === restaurantId);

  const handleSubmit = async (values: MenuItemFormValues) => {
    if (!restaurantId) {
      toast.error("Please select a restaurant first.");
      return;
    }

    try {
      if (editingItem) {
        await updateMenuItem({
          id: editingItem.id,
          restaurantId,
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
          restaurantId,
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

  const handleRestaurantChange = (id: string) => {
    setSearchParams({ restaurantId: id });
  };

  if (isLoadingRestaurants) return <div className="p-8 text-center">Chargement des restaurants...</div>;
  if (!restaurantId) {
    return (
      <div className="space-y-6 py-12">
        <div className="text-center space-y-2">
          <Store className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Sélectionner un restaurant</h2>
          <p className="text-muted-foreground">Veuillez choisir un restaurant pour gérer son menu</p>
        </div>

        {restaurants && restaurants.length > 0 ? (
          <div className="max-w-md mx-auto">
            <Select onValueChange={handleRestaurantChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-4 text-center">
              <Button asChild variant="outline" size="sm">
                <Link to={resolvePath("/admin/restaurants")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un restaurant
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <p className="text-muted-foreground">Aucun restaurant trouvé</p>
            <Button asChild>
              <Link to={resolvePath("/admin/restaurants")}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un restaurant
              </Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl text-red-500 mb-4">Restaurant non trouvé</h2>
        <Button onClick={() => setSearchParams({})}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la sélection
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSearchParams({})}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Changer de restaurant
          </Button>
          <h1 className="text-2xl font-bold">{restaurant.name} - Menu</h1>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un plat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifier le plat" : "Ajouter un plat"}</DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Modifiez les informations du plat."
                  : "Remplissez le formulaire pour ajouter un nouveau plat."}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu de {restaurant.name}</CardTitle>
          <CardDescription>Gérez les plats du restaurant.</CardDescription>
        </CardHeader>
        <CardContent>
          <MenuItemsTable
            items={menuItems || []}
            isLoading={isLoading}
            onEdit={(item) => {
              setEditingItem(item);
              setIsDialogOpen(true);
            }}
            onDelete={deleteMenuItem}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantMenuManager;
