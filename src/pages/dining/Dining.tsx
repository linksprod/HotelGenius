
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Clock, MapPin, Calendar, BookText } from 'lucide-react';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import RestaurantBookingDialog from '@/features/dining/components/RestaurantBookingDialog';
import { Restaurant } from '@/features/dining/types';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useHotelPath } from '@/hooks/useHotelPath';

const Dining = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requireAuth } = useRequireAuth();
  const { isLoading: isHotelLoading } = useHotel();
  const { resolvePath } = useHotelPath();
  const { restaurants, isLoading: isRestaurantsLoading } = useRestaurants();
  const { upcomingEvents } = useEvents();
  const isLoading = isHotelLoading || isRestaurantsLoading;

  // Booking dialog state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const handleBookTable = (restaurantId: string) => {
    requireAuth(() => {
      const restaurant = restaurants?.find(r => r.id === restaurantId);
      if (restaurant) {
        setSelectedRestaurant(restaurant);
        setIsBookingOpen(true);
      }
    });
  };

  const handleBookingSuccess = () => {
    setIsBookingOpen(false);
    setSelectedRestaurant(null);
    toast({
      title: "Success",
      description: "Restaurant booking request sent successfully!",
    });
  };

  // Helper: get next event for a restaurant
  const getEventsForRestaurant = (restaurantId: string) => {
    return (upcomingEvents || []).filter(event => event.restaurant_id === restaurantId);
  };

  return (
    <Layout>
      <div className="text-center mb-8 pt-6 md:pt-8">
        <h1 className="text-4xl font-semibold text-foreground mb-4">{t('dining.title')}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('dining.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">{t('dining.loadingRestaurants')}</div>
        </div>
      ) : !restaurants || restaurants.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">{t('dining.noRestaurants')}</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {restaurants.map(restaurant => (
            <Card key={restaurant.id} className="overflow-hidden animate-fade-in bg-card border-border/50 shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={restaurant.images[0]}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${restaurant.status === 'open' ? 'bg-green-900/80 text-green-200 border border-green-700' : 'bg-red-900/80 text-red-200 border border-red-700'}
                  `}>
                    {t(`common.${restaurant.status}`)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-foreground mb-2">{restaurant.name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>{restaurant.cuisine}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.openHours}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurant.location}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{restaurant.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Button
                    onClick={() => handleBookTable(restaurant.id)}
                    className="w-full flex items-center justify-center gap-1"
                  >
                    <Calendar size={16} />
                    {restaurant.actionText || t('dining.bookTable')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-1 border-border/50 hover:bg-accent"
                    onClick={() => navigate(resolvePath(`/dining/${restaurant.id}`))}
                  >
                    <BookText size={16} />
                    {t('common.viewDetails')}
                  </Button>
                </div>
                {/* Show upcoming events for this restaurant */}
                {getEventsForRestaurant(restaurant.id).length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold mb-1 text-primary">{t('dining.upcomingEvents')}</h4>
                    <ul className="space-y-1">
                      {getEventsForRestaurant(restaurant.id).map(event => (
                        <li key={event.id} className="flex items-center gap-2 text-[15px] text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{event.title} — {event.date}{event.time ? `, ${event.time}` : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Restaurant Booking Dialog */}
      {isBookingOpen && selectedRestaurant && (
        <RestaurantBookingDialog
          isOpen={isBookingOpen}
          onOpenChange={setIsBookingOpen}
          restaurant={selectedRestaurant}
          onSuccess={handleBookingSuccess}
        />
      )}
    </Layout>
  );
};

export default Dining;
