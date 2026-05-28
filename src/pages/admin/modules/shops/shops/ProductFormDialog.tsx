
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShopProduct, ShopProductFormData } from '@/types/shop';
import { useForm } from 'react-hook-form';
import { useShops } from '@/hooks/useShops';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProductFormFields from './form/ProductFormFields';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: ShopProduct | null;
  preselectedShopId?: string;
}

const ProductFormDialog = ({ open, onClose, product, preselectedShopId }: ProductFormDialogProps) => {
  const { shops, createProduct, updateProduct } = useShops();
  const isEditing = !!product;

  const form = useForm<ShopProductFormData>({
    defaultValues: {
      name: '',
      shop_id: preselectedShopId || '',
      description: '',
      price: undefined,
      image: '',
      is_featured: false,
      category: '',
      status: 'available'
    }
  });

  React.useEffect(() => {
    if (open) {
      if (product) {
        form.reset({
          name: product.name,
          shop_id: product.shop_id,
          description: product.description || '',
          price: product.price,
          image: product.image || '',
          is_featured: product.is_featured || false,
          category: product.category || '',
          status: product.status || 'available'
        });
      } else {
        form.reset({
          name: '',
          shop_id: preselectedShopId || '',
          description: '',
          price: undefined,
          image: '',
          is_featured: false,
          category: '',
          status: 'available'
        });
      }
    }
  }, [open, product, form, preselectedShopId]);

  const onSubmit = (data: ShopProductFormData) => {
    if (isEditing && product) {
      updateProduct({ id: product.id, data });
    } else {
      createProduct(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Modifier le produit: ${product?.name}` : 'Ajouter un nouveau produit'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full pr-4">
          <ProductFormFields 
            form={form} 
            shops={shops} 
            onSubmit={onSubmit} 
            onCancel={onClose} 
            isEditing={isEditing} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
