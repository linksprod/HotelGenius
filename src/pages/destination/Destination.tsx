
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Car, Landmark, ShoppingBag, Ticket } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

const Destination = () => {
  const { t } = useTranslation();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();

  // Fetch destination categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['destinationCategories', hotelId, isSuperAdmin],
    queryFn: async () => {
      if (!hotelId && !isSuperAdmin) return [];

      let query = supabase
        .from('destination_categories')
        .select('*');

      if (hotelId && !isSuperAdmin) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch attractions
  const { data: attractions, isLoading: isLoadingAttractions } = useQuery({
    queryKey: ['attractions', hotelId, isSuperAdmin],
    queryFn: async () => {
      if (!hotelId && !isSuperAdmin) return [];

      let query = supabase
        .from('attractions')
        .select('*');

      if (hotelId && !isSuperAdmin) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['activities', hotelId, isSuperAdmin],
    queryFn: async () => {
      if (!hotelId && !isSuperAdmin) return [];

      let query = supabase
        .from('destination_activities')
        .select('*');

      if (hotelId && !isSuperAdmin) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch car rentals
  const { data: carRentals, isLoading: isLoadingCarRentals } = useQuery({
    queryKey: ['carRentals', hotelId, isSuperAdmin],
    queryFn: async () => {
      if (!hotelId && !isSuperAdmin) return [];

      let query = supabase
        .from('car_rentals')
        .select('*');

      if (hotelId && !isSuperAdmin) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch public transport options
  const { data: publicTransport, isLoading: isLoadingTransport } = useQuery({
    queryKey: ['publicTransport', hotelId, isSuperAdmin],
    queryFn: async () => {
      if (!hotelId && !isSuperAdmin) return [];

      let query = supabase
        .from('public_transport')
        .select('*');

      if (hotelId && !isSuperAdmin) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data || [];
    }
  });

  // Default to showing some UI even when there's no data yet
  const defaultCategories = [
    { id: '1', name: t('destinationPage.categories.nearby'), icon: '' },
    { id: '2', name: t('destinationPage.categories.landmarks'), icon: '' },
    { id: '3', name: t('destinationPage.categories.cafes'), icon: '' },
    { id: '4', name: t('destinationPage.categories.shopping'), icon: '' }
  ];

  // Use dynamic categories if available, otherwise use defaults
  const displayCategories = categories?.length ? categories : defaultCategories;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="City View"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{t('destinationPage.title')}</h1>
            <p className="text-xl mb-6">{t('destinationPage.subtitle')}</p>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-secondary mb-4">{t('destinationPage.discover')}</h2>
          <div className="grid grid-cols-4 gap-3">
            {isLoadingCategories ? (
              // Show skeleton loading state
              Array(4).fill(0).map((_, index) => (
                <Button key={index} variant="outline" className="flex-col h-auto py-3 opacity-50" disabled>
                  <div className="w-6 h-6 rounded-full bg-muted mb-1"></div>
                  <div className="w-12 h-3 bg-muted rounded"></div>
                </Button>
              ))
            ) : (
              displayCategories.map((category) => (
                <Button key={category.id} variant="outline" className="flex-col h-auto py-3">
                  {category.icon ? (
                    <img src={category.icon} alt={category.name} className="h-6 w-6 mb-1" />
                  ) : (
                    getCategoryIcon(category.name, t)
                  )}
                  <span className="text-xs">{category.name}</span>
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Recommended Places */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-secondary mb-4">{t('destinationPage.attractions.title')}</h2>
          <div className="space-y-4">
            {isLoadingAttractions ? (
              // Loading state
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="flex h-40">
                    <div className="w-1/3 bg-muted"></div>
                    <div className="w-2/3 p-4">
                      <div className="h-5 bg-muted rounded mb-2 w-1/2"></div>
                      <div className="h-3 bg-muted rounded mb-2 w-3/4"></div>
                      <div className="h-10 bg-muted rounded mb-2"></div>
                      <div className="h-8 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : attractions && attractions.length > 0 ? (
              attractions.map((attraction) => (
                <Card key={attraction.id} className="overflow-hidden">
                  <div className="flex min-h-40">
                    <div className="w-1/3 h-full">
                      <img
                        src={attraction.image}
                        alt={attraction.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{attraction.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{attraction.description}</p>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground flex-wrap gap-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-primary" />
                          <span className="font-medium">{attraction.distance}</span>
                        </div>
                        <span className="mx-1">•</span>
                        <span className="flex-shrink-0">{attraction.opening_hours}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              // Default content when no attractions are available
              <>
                <Card className="overflow-hidden">
                  <div className="flex h-40">
                    <div className="w-1/3 h-full">
                      <img
                        src="https://images.unsplash.com/photo-1466442929976-97f336a657be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2834&q=80"
                        alt="Historic Mosque"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{t('destinationPage.attractions.defaultItems.mosque.name')}</h3>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{t('destinationPage.attractions.defaultItems.mosque.description')}</p>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 text-primary" />
                        <span className="font-medium">{t('destinationPage.attractions.defaultItems.mosque.distance')}</span>
                        <span className="mx-2">•</span>
                        <span>{t('destinationPage.attractions.defaultItems.mosque.hours')}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="flex h-40">
                    <div className="w-1/3 h-full">
                      <img
                        src="https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2671&q=80"
                        alt="Historic Theatre"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{t('destinationPage.attractions.defaultItems.theatre.name')}</h3>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{t('destinationPage.attractions.defaultItems.theatre.description')}</p>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 text-primary" />
                        <span className="font-medium">{t('destinationPage.attractions.defaultItems.theatre.distance')}</span>
                        <span className="mx-2">•</span>
                        <span>{t('destinationPage.attractions.defaultItems.theatre.hours')}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="flex h-40">
                    <div className="w-1/3 h-full">
                      <img
                        src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=4000&q=80"
                        alt="Scenic Bridge"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{t('destinationPage.attractions.defaultItems.bridge.name')}</h3>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{t('destinationPage.attractions.defaultItems.bridge.description')}</p>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 text-primary" />
                        <span className="font-medium">{t('destinationPage.attractions.defaultItems.bridge.distance')}</span>
                        <span className="mx-2">•</span>
                        <span>{t('destinationPage.attractions.defaultItems.bridge.hours')}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Activities Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-secondary mb-4">{t('destinationPage.activities.title')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {isLoadingActivities ? (
              // Loading state
              Array(2).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="h-40 bg-muted"></div>
                  <div className="p-3">
                    <div className="h-5 bg-muted rounded mb-2 w-1/2"></div>
                    <div className="h-3 bg-muted rounded mb-3 w-3/4"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                  </div>
                </Card>
              ))
            ) : activities && activities.length > 0 ? (
              activities.map((activity) => (
                <Card key={activity.id} className="overflow-hidden">
                  <div className="h-40 relative">
                    <img
                      src={activity.image}
                      alt={activity.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-3 text-white">
                      <h3 className="font-semibold">{activity.name}</h3>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                    <Button size="sm" className="w-full">{t('destinationPage.activities.bookNow')}</Button>
                  </div>
                </Card>
              ))
            ) : (
              // Default content when no activities are available
              <>
                <Card className="overflow-hidden">
                  <div className="h-40 relative">
                    <img
                      src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                      alt="City Tour"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-3 text-white">
                      <h3 className="font-semibold">{t('destinationPage.activities.defaultItems.cityTour.name')}</h3>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-600 mb-3">{t('destinationPage.activities.defaultItems.cityTour.description')}</p>
                    <Button size="sm" className="w-full">{t('destinationPage.activities.defaultItems.cityTour.action')}</Button>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="h-40 relative">
                    <img
                      src="https://images.unsplash.com/photo-1499591934045-40b55745b12f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
                      alt="Boat Trip"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-3 text-white">
                      <h3 className="font-semibold">{t('destinationPage.activities.defaultItems.boatTrip.name')}</h3>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-600 mb-3">{t('destinationPage.activities.defaultItems.boatTrip.description')}</p>
                    <Button size="sm" className="w-full">{t('destinationPage.activities.defaultItems.boatTrip.action')}</Button>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Transportation */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary mb-4">{t('destinationPage.transportation.title')}</h2>

          {/* Car Rental */}
          {isLoadingCarRentals ? (
            <Card className="p-4 rounded-xl mb-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="bg-muted p-2 rounded-lg h-9 w-9"></div>
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded mb-2 w-1/3"></div>
                  <div className="h-3 bg-muted rounded mb-3 w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            </Card>
          ) : carRentals && carRentals.length > 0 ? (
            carRentals.map((carRental) => (
              <Card key={carRental.id} className="p-4 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{carRental.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{carRental.description}</p>
                    {carRental.website ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(carRental.website, '_blank')}
                      >
                        {t('destinationPage.transportation.carRental.visitWebsite')}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">{t('destinationPage.transportation.carRental.bookCar')}</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-4 rounded-xl mb-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('destinationPage.transportation.carRental.title')}</h3>
                  <p className="text-sm text-gray-600 mb-2">{t('destinationPage.transportation.carRental.description')}</p>
                  <Button size="sm" variant="outline">{t('destinationPage.transportation.carRental.bookCar')}</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Public Transportation */}
          {isLoadingTransport ? (
            <Card className="p-4 rounded-xl animate-pulse">
              <div className="flex items-start gap-3">
                <div className="bg-muted p-2 rounded-lg h-9 w-9"></div>
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded mb-2 w-1/3"></div>
                  <div className="h-3 bg-muted rounded mb-3 w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            </Card>
          ) : publicTransport && publicTransport.length > 0 ? (
            publicTransport.map((transport) => (
              <Card key={transport.id} className="p-4 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Ticket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{transport.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{transport.description}</p>
                    {transport.website ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(transport.website, '_blank')}
                      >
                        {t('destinationPage.transportation.carRental.visitWebsite')}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">{t('destinationPage.transportation.publicTransport.viewSchedule')}</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Ticket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('destinationPage.transportation.publicTransport.title')}</h3>
                  <p className="text-sm text-gray-600 mb-2">{t('destinationPage.transportation.publicTransport.description')}</p>
                  <Button size="sm" variant="outline">{t('destinationPage.transportation.publicTransport.viewSchedule')}</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Helper function to get icons based on category name
const getCategoryIcon = (name: string, t: any) => {
  const iconMap: Record<string, React.ReactNode> = {
    [t('destinationPage.categories.nearby')]: <Navigation className="h-6 w-6 mb-1" />,
    [t('destinationPage.categories.landmarks')]: <Landmark className="h-6 w-6 mb-1" />,
    [t('destinationPage.categories.cafes')]: <div className="h-6 w-6 mb-1 flex items-center justify-center">☕</div>,
    [t('destinationPage.categories.shopping')]: <ShoppingBag className="h-6 w-6 mb-1" />,
  };

  return iconMap[name] || <Navigation className="h-6 w-6 mb-1" />;
};

export default Destination;
