import React, { useState } from 'react';
import { PlusCircle, Search, Pencil } from 'lucide-react';
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
import { useRequestCategories } from '@/hooks/useRequestCategories';

type HousekeepingItemsTabProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  openAddItemDialog: () => void;
  openEditDialog: (item: RequestItem) => void;
  createHousekeepingCategory: () => Promise<any>;
};

const HousekeepingItemsTab = ({
  searchTerm,
  setSearchTerm,
  openAddItemDialog,
  openEditDialog,
  createHousekeepingCategory
}: HousekeepingItemsTabProps) => {
  const { categories, allItems, isLoading } = useRequestCategories();

  // Find the Housekeeping category
  const housekeepingCategory = categories.find(cat => cat.name === 'Housekeeping');

  // Filter items by the Housekeeping category
  const housekeepingItems = allItems.filter(
    item => item.category_id === (housekeepingCategory?.id || '') &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = async () => {
    if (!housekeepingCategory) {
      try {
        const newCategory = await createHousekeepingCategory();
        // Pass the new category's ID if needed or just open the dialog
        // The dialog in the manager uses the 'newItem' state which we should probably update
        openAddItemDialog();
      } catch (error) {
        console.error("Failed to initialize category:", error);
      }
    } else {
      openAddItemDialog();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Housekeeping Service Items</CardTitle>
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
        ) : housekeepingItems.length > 0 ? (
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
              {housekeepingItems.map((item) => (
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {!housekeepingCategory ? (
              <div className="space-y-4">
                <p>Housekeeping category not found. Please initialize it first.</p>
                <Button onClick={createHousekeepingCategory}>
                  Initialize Housekeeping
                </Button>
              </div>
            ) : (
              "No housekeeping items found."
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HousekeepingItemsTab;
