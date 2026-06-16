import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Restaurant } from '@/features/dining/types';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { translateOpenHours } from '@/utils/restaurantTranslation';

interface RestaurantInfoProps {
  restaurant: Restaurant;
  onBookingClick: () => void;
  onViewMenuClick?: () => void;  // New prop for viewing menu
  showBookingButton?: boolean;
}

const RestaurantInfo = ({ 
  restaurant, 
  onBookingClick, 
  onViewMenuClick,
  showBookingButton = true
}: RestaurantInfoProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{t(`restaurants.name.${restaurant.id}`, restaurant.name)}</h1>
        <p className="text-muted-foreground">{t(`restaurants.description.${restaurant.id}`, restaurant.description)}</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span>{translateOpenHours(t(`restaurants.openHours.${restaurant.id}`, restaurant.openHours), i18n.language)}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <span>{t(`restaurants.location.${restaurant.location?.trim()}`, restaurant.location)}</span>
        </div>
      </div>
      
      <div className="flex gap-4">
        {showBookingButton && (
          <Button 
            onClick={onBookingClick} 
            className="flex-1"
          >
            {restaurant.actionText ? t(`restaurants.action.${restaurant.actionText}`, restaurant.actionText) : t('dining.bookTable')}
          </Button>
        )}
        {onViewMenuClick && (
          <Button 
            onClick={onViewMenuClick} 
            variant="outline" 
            className="flex-1"
          >
            {t('dining.viewMenu', 'View Menu')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RestaurantInfo;
