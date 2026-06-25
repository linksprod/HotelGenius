
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, UtensilsCrossed, Calendar, BookText } from 'lucide-react';
import { Restaurant } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { translateOpenHours } from '@/utils/restaurantTranslation';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onBookTable: (restaurantId: string) => void;
}

const RestaurantCard = ({ restaurant, onBookTable }: RestaurantCardProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const images = restaurant.images && restaurant.images.length > 0
    ? restaurant.images
    : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop'];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  return (
    <Card className="w-full snap-center animate-fade-in bg-card border-border">
      <div className="aspect-video relative overflow-hidden rounded-t-lg group/img">
        <img 
          src={images[currentImageIndex]} 
          alt={restaurant.name}
          className="w-full h-full object-cover transition-all duration-300"
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover/img:opacity-100 font-bold z-10 text-xs"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover/img:opacity-100 font-bold z-10 text-xs"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 px-1.5 py-0.5 rounded-full z-10">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentImageIndex ? 'bg-white scale-110' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-2 right-2 z-10">
          <span className={`
            px-2 py-1 rounded-full text-xs font-semibold
            ${restaurant.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
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
            {translateOpenHours(t(`restaurants.openHours.${restaurant.id}`, restaurant.openHours), i18n.language)}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {t(`restaurants.location.${restaurant.location?.trim()}`) || restaurant.location}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t(`restaurants.description.${restaurant.id}`) || restaurant.description}</p>
        <div className={restaurant.bookingEnabled !== false ? "grid grid-cols-2 gap-2" : "flex gap-2"}>
          {restaurant.bookingEnabled !== false && (
            <Button 
              onClick={() => onBookTable(restaurant.id)}
              className="w-full flex items-center justify-center gap-1"
            >
              <Calendar size={16} />
              {restaurant.actionText ? t(`restaurants.action.${restaurant.actionText}`, restaurant.actionText) : t('dining.bookTable')}
            </Button>
          )}
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
