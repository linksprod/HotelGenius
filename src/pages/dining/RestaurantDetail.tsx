
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Clock, MapPin, Calendar, BookText } from 'lucide-react';
import Layout from '@/components/Layout';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { EventsSection } from '@/components/events/EventsSection';
import { useEvents } from '@/hooks/useEvents';
import { useQuery } from '@tanstack/react-query';
import { fetchRestaurantById } from '@/features/dining/services/restaurantService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RestaurantMenu from './components/RestaurantMenu';
import RestaurantInfo from './components/RestaurantInfo';
import { useRestaurantMenus } from '@/hooks/useRestaurantMenus';
import RestaurantBookingDialog from '@/features/dining/components/RestaurantBookingDialog';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const RestaurantDetail = () => {
  const { id } = useParams();
  const restaurantId = id as string;
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { requireAuth } = useRequireAuth();
  const { upcomingEvents } = useEvents();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const { menuItems, isLoading: menuLoading } = useRestaurantMenus(restaurantId);

  // Use React Query directly to fetch a single restaurant
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => fetchRestaurantById(restaurantId),
    enabled: !!restaurantId,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (location.state?.openBooking || urlParams.get('openBooking') === 'true') {
      setIsBookingOpen(true);
    }
  }, [location.state, location.search]);

  const handleBookTable = () => {
    requireAuth(() => {
      setIsBookingOpen(true);
    });
  };

  const handleBookingSuccess = () => {
    setIsBookingOpen(false);
    toast({
      title: "Success",
      description: "Restaurant booking request sent successfully!",
    });
  };

  const restaurantEvents = upcomingEvents?.filter(
    event => event.restaurant_id === restaurantId
  ) || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading restaurant details...</div>
          </div>
        ) : !restaurant ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Restaurant not found.</div>
          </div>
        ) : (
          <>
            <section className="mb-8">
              <Card className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2 relative">
                    <Carousel
                      opts={{
                        loop: true,
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="w-full">
                        {restaurant.images.map((image, index) => (
                          <CarouselItem key={index} className="w-full">
                            <img
                              src={image}
                              alt={`${restaurant.name} - Image ${index + 1}`}
                              className="w-full h-96 object-cover"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="hidden sm:flex" />
                      <CarouselNext className="hidden sm:flex" />
                    </Carousel>
                  </div>
                  <div className="p-6 md:w-1/2">
                    <h1 className="text-3xl font-semibold text-foreground mb-4">{restaurant.name}</h1>
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
                    <p className="text-muted-foreground mb-6">{restaurant.description}</p>
                    <Button onClick={handleBookTable}>
                      {restaurant.actionText || "Book a Table"}
                    </Button>
                  </div>
                </div>
              </Card>
            </section>

            <section className="mb-8">
              <Card>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">Information</TabsTrigger>
                    <TabsTrigger value="menu">Menu</TabsTrigger>
                  </TabsList>
                  <TabsContent value="info" className="p-4">
                    <RestaurantInfo
                      restaurant={restaurant}
                      onBookingClick={handleBookTable}
                      onViewMenuClick={() => setActiveTab("menu")}
                    />
                  </TabsContent>
                  <TabsContent value="menu" className="p-4">
                    <RestaurantMenu
                      menuItems={menuItems}
                      isLoading={menuLoading}
                    />
                  </TabsContent>
                </Tabs>
              </Card>
            </section>

            {/* Add Events Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Upcoming Events
              </h2>
              <EventsSection events={restaurantEvents} />
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">Reviews</h2>
              <Card className="p-6">
                <p className="text-muted-foreground">No reviews yet.</p>
              </Card>
            </section>
          </>
        )}

        {/* Restaurant Booking Dialog */}
        {isBookingOpen && restaurant && (
          <RestaurantBookingDialog
            isOpen={isBookingOpen}
            onOpenChange={setIsBookingOpen}
            restaurant={restaurant}
            onSuccess={handleBookingSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default RestaurantDetail;
