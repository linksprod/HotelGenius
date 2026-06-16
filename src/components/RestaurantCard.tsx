
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, UtensilsCrossed, Calendar, BookText } from 'lucide-react';
import { Restaurant } from '../features/dining/types';
import { Link, useNavigate } from 'react-router-dom';
import { translateOpenHours } from '@/utils/restaurantTranslation';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onBookTable: (restaurantId: string) => void;
}

const RestaurantCard = ({ restaurant, onBookTable }: RestaurantCardProps) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const navigate = useNavigate();
  
  return (
    <Card className="w-full snap-center animate-fade-in bg-card border-border">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img 
          src={restaurant.images[0]} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${restaurant.status === 'open' 
              ? 'bg-green-100 text-green-800 dark:bg-muted dark:text-card-foreground' 
              : 'bg-red-100 text-red-800 dark:bg-muted dark:text-card-foreground'
            }
          `}>
            {t(`common.${restaurant.status}`)}
          </span>
        </div>
      </div>
      <div className="p-4 bg-card">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">{t(`restaurants.name.${restaurant.id}`, restaurant.name)}</h3>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UtensilsCrossed className="w-4 h-4" />
            {t(`restaurants.cuisine.${restaurant.cuisine?.trim()}`) || restaurant.cuisine}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {translateOpenHours(restaurant.openHours, language)}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {t(`restaurants.location.${restaurant.location?.trim()}`) || restaurant.location}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t(`restaurants.description.${restaurant.id}`) || restaurant.description}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => onBookTable(restaurant.id)}
            className="w-full flex items-center justify-center gap-1"
          >
            <Calendar size={16} />
            {restaurant.actionText ? t(`restaurants.action.${restaurant.actionText}`, restaurant.actionText) : t('dining.bookTable')}
          </Button>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-1"
            onClick={() => navigate(`/dining/${restaurant.id}`)}
          >
            <BookText size={16} />
            {t('common.viewDetails')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RestaurantCard;
