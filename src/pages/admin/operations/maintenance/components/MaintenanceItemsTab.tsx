
import React from 'react';
import { PlusCircle, Search, Pencil, Trash2 } from 'lucide-react';
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
import { RequestItem } from '@/features/rooms/types';
import { useRequestCategories, useDeleteRequestItem } from '@/hooks/useRequestCategories';
import { useToast } from '@/hooks/use-toast';
import DeleteServiceItemDialog from '@/pages/admin/operations/components/DeleteServiceItemDialog';

type MaintenanceItemsTabProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  openAddItemDialog: () => void;
  openEditDialog: (item: RequestItem) => void;
  categoryIds: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createMaintenanceCategories: () => Promise<any>;
};

const MaintenanceItemsTab = ({
  searchTerm,
  setSearchTerm,
  openAddItemDialog,
  openEditDialog,
  categoryIds,
  createMaintenanceCategories
}: MaintenanceItemsTabProps) => {
  const { allItems, isLoading } = useRequestCategories();
  const deleteItem = useDeleteRequestItem();
  const { toast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<RequestItem | null>(null);

  // Filter items by the Maintenance or Technical categories
  const maintenanceItems = allItems.filter(
    item => categoryIds.includes(item.category_id) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (item: RequestItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem.mutateAsync(itemToDelete.id);
      toast({
        title: "Success",
        description: "Item deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  const handleAddItem = async () => {
    if (categoryIds.length === 0) {
      try {
        await createMaintenanceCategories();
        openAddItemDialog();
      } catch (error) {
        console.error("Failed to initialize categories:", error);
      }
    } else {
      openAddItemDialog();
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Maintenance Service Items</CardTitle>
            <Button
              onClick={handleAddItem}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : maintenanceItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(item)}
                        disabled={deleteItem.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {categoryIds.length === 0 ? (
                <div className="space-y-4">
                  <p>Maintenance category not found. Please initialize it first.</p>
                  <Button onClick={createMaintenanceCategories}>
                    Initialize Maintenance
                  </Button>
                </div>
              ) : (
                "No maintenance items found."
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteServiceItemDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={itemToDelete?.name || ''}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteItem.isPending}
      />
    </>
  );
};

export default MaintenanceItemsTab;
