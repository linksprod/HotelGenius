
import React, { useEffect } from 'react';
import { Restaurant } from '@/features/dining/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { restaurantFormSchema, RestaurantFormValues } from './form/RestaurantFormSchema';
import RestaurantBasicInfo from './form/RestaurantBasicInfo';
import RestaurantDetails from './form/RestaurantDetails';
import ImageUploader from './form/ImageUploader';
import { useRestaurants } from '@/hooks/useRestaurants';
import { toast } from 'sonner';

interface RestaurantFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: (success?: boolean) => void;
  restaurant: Restaurant | null;
}

const RestaurantFormDialog = ({ 
  isOpen, 
  onOpenChange, 
  onClose, 
  restaurant 
}: RestaurantFormDialogProps) => {
  const { createRestaurant, updateRestaurant, isCreating, isUpdating } = useRestaurants();
  
  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: "",
      description: "",
      cuisine: "",
      openHours: "",
      location: "",
      status: "open",
      actionText: "Book a Table",
      isFeatured: false,
      bookingEnabled: true,
      images: [],
    },
  });
  
  // Update form values when editing restaurant changes or dialog opens
  useEffect(() => {
    if (isOpen && restaurant) {
      form.reset({
        name: restaurant.name,
        description: restaurant.description,
        cuisine: restaurant.cuisine,
        openHours: restaurant.openHours,
        location: restaurant.location,
        status: restaurant.status,
        actionText: restaurant.actionText || "Book a Table",
        isFeatured: restaurant.isFeatured || false,
        bookingEnabled: restaurant.bookingEnabled !== false,
        images: restaurant.images,
      });
    } else if (isOpen && !restaurant) {
      // Reset form when opening for a new restaurant
      form.reset({
        name: "",
        description: "",
        cuisine: "",
        openHours: "",
        location: "",
        status: "open",
        actionText: "Book a Table",
        isFeatured: false,
        bookingEnabled: true,
        images: [],
      });
    }
  }, [isOpen, restaurant, form]);

  const onSubmit = async (values: RestaurantFormValues) => {
    try {
      if (restaurant) {
        // Update existing restaurant
        await updateRestaurant({
          ...restaurant,
          ...values,
        });
        toast.success('Restaurant updated successfully');
      } else {
        // Create new restaurant - Ensure all required fields are explicitly present
        await createRestaurant({
          name: values.name,
          description: values.description,
          cuisine: values.cuisine,
          openHours: values.openHours,
          location: values.location,
          status: values.status,
          actionText: values.actionText,
          isFeatured: values.isFeatured,
          bookingEnabled: values.bookingEnabled,
          images: values.images,
        });
        toast.success('Restaurant created successfully');
      }
      onClose(true);
    } catch (error) {
      console.error('Error submitting restaurant form:', error);
      toast.error('Failed to save restaurant. Please try again.');
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{restaurant ? "Edit Restaurant" : "Add New Restaurant"}</DialogTitle>
          <DialogDescription>
            {restaurant 
              ? "Update the restaurant details below." 
              : "Fill out the form below to add a new restaurant."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <RestaurantBasicInfo form={form} />
              <RestaurantDetails form={form} />
              <ImageUploader form={form} />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : restaurant ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantFormDialog;
