
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, ChevronLeft } from 'lucide-react';
import { useRequestItems } from '@/hooks/useRequestCategories';
import { RequestCategory, RequestItem } from '@/features/rooms/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslatedServices } from '@/i18n/translationHelpers';

interface RequestItemListProps {
  category: RequestCategory;
  onGoBack: () => void;
  selectedItems: string[];
  onToggleItem: (itemId: string) => void;
}

const RequestItemList = ({ 
  category, 
  onGoBack, 
  selectedItems,
  onToggleItem
}: RequestItemListProps) => {
  const { data: items, isLoading, error } = useRequestItems(category.id);
  const { translateCategory, translateItemName, translateItemDescription } = useTranslatedServices();

  // Filter only active items
  const activeItems = items?.filter(item => item.is_active) || [];

  // Helper function to check if an item is selected
  const isItemSelected = (itemId: string) => {
    return selectedItems.includes(itemId);
  };

  if (error) {
    console.error("Error loading request items:", error);
  }

  return (
    <div>
      <div className="mb-4 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={onGoBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h3 className="text-lg font-medium">{translateCategory(category.name)}</h3>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !activeItems || activeItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No items available in this category</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeItems.map((item) => {
            const checked = isItemSelected(item.id);
            
            return (
              <Card 
                key={item.id}
                className="p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onToggleItem(item.id)}
              >
                <div className="flex items-center">
                  <Checkbox 
                    id={`item-${item.id}`}
                    checked={checked}
                    onCheckedChange={() => onToggleItem(item.id)}
                    className="mr-3"
                  />
                  <label 
                    htmlFor={`item-${item.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{translateItemName(item.name)}</div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">
                        {translateItemDescription(item.name, item.description)}
                      </p>
                    )}
                  </label>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequestItemList;
