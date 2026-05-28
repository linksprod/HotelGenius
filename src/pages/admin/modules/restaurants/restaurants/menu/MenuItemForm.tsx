
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { MenuItemFormValues, menuItemFormSchema } from './MenuItemFormSchema';
import { MenuItem } from '@/features/dining/types';
import { Button } from '@/components/ui/button';
import { DialogFooter } from "@/components/ui/dialog";
import { MenuItemBasicFields } from './form/MenuItemBasicFields';
import { MenuItemImageField } from './form/MenuItemImageField';
import { MenuItemPdfField } from './form/MenuItemPdfField';
import { MenuItemStatusFields } from './form/MenuItemStatusFields';

interface MenuItemFormProps {
  onSubmit: (values: MenuItemFormValues) => void;
  editingItem: MenuItem | null;
}

const MenuItemForm = ({ onSubmit, editingItem }: MenuItemFormProps) => {
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: editingItem ? {
      name: editingItem.name,
      description: editingItem.description,
      price: editingItem.price,
      category: editingItem.category,
      image: editingItem.image || "",
      isFeatured: editingItem.isFeatured,
      status: editingItem.status,
      menuPdf: editingItem.menuPdf || "",
    } : {
      name: "",
      description: "",
      price: 0,
      category: "",
      image: "",
      isFeatured: false,
      status: "available" as const,
      menuPdf: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <MenuItemBasicFields form={form} />
        <MenuItemImageField form={form} />
        <MenuItemPdfField form={form} />
        <MenuItemStatusFields form={form} />
        
        <DialogFooter className="pt-4">
          <Button type="submit">
            {editingItem ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default MenuItemForm;
