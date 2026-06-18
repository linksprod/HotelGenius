
import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { useRequestCategories } from '@/hooks/useRequestCategories';
import { RequestCategory } from '@/features/rooms/types';
import { useTranslatedServices } from '@/i18n/translationHelpers';

interface RequestCategoryListProps {
  onSelectCategory: (category: RequestCategory) => void;
}

const RequestCategoryList = ({ onSelectCategory }: RequestCategoryListProps) => {
  const { categories, isLoading } = useRequestCategories();
  const { translateCategory, translateCategoryDescription } = useTranslatedServices();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No request categories available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((category) => (
        <Card 
          key={category.id}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectCategory(category)}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {category.icon ? (
                <span className="text-xl">{category.icon}</span>
              ) : (
                <span className="text-xl">📋</span>
              )}
            </div>
            <div>
              <h3 className="font-medium">{translateCategory(category.name)}</h3>
              {category.description && (
                <p className="text-sm text-muted-foreground">
                  {translateCategoryDescription(category.name, category.description)}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RequestCategoryList;
