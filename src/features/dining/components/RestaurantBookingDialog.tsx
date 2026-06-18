import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import RestaurantBookingForm from './RestaurantBookingForm';
import { Restaurant } from '../types';

interface RestaurantBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant;
  onSuccess?: () => void;
}

const RestaurantBookingDialog = ({
  isOpen,
  onOpenChange,
  restaurant,
  onSuccess
}: RestaurantBookingDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-secondary">
            {t('dining.booking.bookTitle', 'Book a Table - {{name}}', { name: restaurant.name })}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('dining.booking.bookDesc', 'Fill out the form below to book a table.')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              <strong>{t('dining.booking.restaurantLabel', 'Restaurant:')}</strong> {restaurant.name}
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              <strong>{t('dining.booking.cuisineLabel', 'Cuisine:')}</strong> {restaurant.cuisine}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>{t('dining.booking.locationLabel', 'Location:')}</strong> {restaurant.location}
            </p>
          </div>
          
          <RestaurantBookingForm
            restaurant={restaurant}
            onSuccess={() => {
              onOpenChange(false);
              if (onSuccess) onSuccess();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantBookingDialog;