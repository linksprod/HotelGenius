
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { Utensils } from 'lucide-react';

interface MenuCategory {
  category: string;
  items: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    isFeatured: boolean;
    status: string;
  }[];
}

interface MenuSelectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  menuCategories: MenuCategory[];
  isLoadingMenuItems: boolean;
}

const MenuSelection = ({ form, menuCategories, isLoadingMenuItems }: MenuSelectionProps) => {
  if (isLoadingMenuItems) {
    return (
      <div className="space-y-2">
        <FormLabel>Menu (optionnel)</FormLabel>
        <div className="h-10 w-full animate-pulse bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <FormField
        control={form.control}
        name="menuId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Menu (optionnel)</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || 'none'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a menu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a menu</SelectItem>
                {menuCategories.map((category) => (
                  <React.Fragment key={category.category}>
                    {category.items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - {item.price} €
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {menuCategories.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Pré-sélectionnez un plat pour votre réservation (optionnel).
          </p>
          
          <ScrollArea className="h-64 rounded-md border">
            {menuCategories.map((category) => (
              <div key={category.category} className="p-4">
                <h3 className="font-medium text-sm mb-2">{category.category}</h3>
                <div className="grid gap-2">
                  {category.items.map((item) => (
                    <Card 
                      key={item.id}
                      className={`border cursor-pointer hover:bg-slate-50 transition-colors ${
                        form.watch('menuId') === item.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => form.setValue('menuId', item.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <p className="font-medium">{item.price} €</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            {menuCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Utensils className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Aucun menu disponible pour ce restaurant</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default MenuSelection;
