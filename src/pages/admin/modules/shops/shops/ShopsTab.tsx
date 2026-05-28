
import React, { useState } from 'react';
import { useShops } from '@/hooks/useShops';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import ShopFormDialog from './ShopFormDialog';
import { Shop } from '@/types/shop';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ShopsTab = () => {
  const { shops, isLoadingShops, deleteShop, categories } = useShops();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const handleCreateShop = () => {
    setSelectedShop(null);
    setIsDialogOpen(true);
  };

  const handleEditShop = (shop: Shop) => {
    setSelectedShop(shop);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedShop(null);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '-';
  };

  if (isLoadingShops) {
    return <div className="flex justify-center p-6">Chargement des boutiques...</div>;
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Liste des boutiques</h2>
          <Button onClick={handleCreateShop} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Ajouter une boutique
          </Button>
        </div>

        {shops.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune boutique disponible. Créez votre première boutique !
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{shop.short_description || shop.description}</TableCell>
                    <TableCell>{shop.category_id ? getCategoryName(shop.category_id) : '-'}</TableCell>
                    <TableCell>{shop.location || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        shop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {shop.status === 'active' ? 'Actif' : shop.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditShop(shop)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la boutique ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. La boutique "{shop.name}" et tous ses produits associés seront supprimés définitivement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteShop(shop.id)}>Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ShopFormDialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
        shop={selectedShop} 
      />
    </>
  );
};

export default ShopsTab;
