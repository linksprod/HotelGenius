
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MenuItem } from '@/features/dining/types';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestaurantMenuProps {
  menuItems: MenuItem[] | undefined;
  isLoading: boolean;
}

const RestaurantMenu = ({ menuItems, isLoading }: RestaurantMenuProps) => {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  if (isLoading) {
    return <div className="text-center py-8">Chargement du menu...</div>;
  }

  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Menu non disponible</p>
      </div>
    );
  }

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <>
      <div className="space-y-8">
        {categories.map(category => (
          <div key={category} className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">{category}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {menuItems.filter(item => item.category === category).map(item => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image && (
                    <div className="relative aspect-video">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {item.isFeatured && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Recommandé
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-semibold">{item.price} €</span>
                        {item.menuPdf && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => setSelectedPdf(item.menuPdf)}
                          >
                            <FileText className="h-4 w-4" />
                            Voir le menu
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPdf} onOpenChange={(open) => !open && setSelectedPdf(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          <DialogHeader className="absolute top-0 right-0 z-10 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => setSelectedPdf(null)}
            >
              ✕
            </Button>
          </DialogHeader>
          {selectedPdf && (
            <iframe
              src={selectedPdf}
              className="w-full h-full"
              title="Menu PDF"
              style={{ border: 'none' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RestaurantMenu;
