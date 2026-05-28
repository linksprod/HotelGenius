
import React, { useState } from 'react';
import { useShops } from '@/hooks/useShops';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shop } from '@/types/shop';
import ShopFormDialog from './ShopFormDialog';

const NearbyShopsTab = () => {
  const { shops, deleteShop } = useShops();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  // Filter only nearby shopping centers (non-hotel shops)
  const nearbyShops = shops.filter(shop => !shop.is_hotel_shop);

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

  return (
    <>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Nearby Shopping Centers</h2>
          <Button onClick={handleCreateShop} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Shopping Center
          </Button>
        </div>

        {nearbyShops.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No nearby shopping centers added yet. Add your first one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nearbyShops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-primary" />
                        {shop.location || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{shop.description}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        shop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {shop.status}
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
                            <AlertDialogTitle>Delete shopping center?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action is irreversible. The shopping center "{shop.name}" will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteShop(shop.id)}>Delete</AlertDialogAction>
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
        isHotelShop={false}
      />
    </>
  );
};

export default NearbyShopsTab;
