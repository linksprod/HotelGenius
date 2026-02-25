
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Utensils } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurants } from '@/hooks/useRestaurants';
import { RestaurantTable } from '@/components/admin/restaurants/RestaurantTable';
import RestaurantFormDialog from '@/components/admin/restaurants/RestaurantFormDialog';
import RestaurantBookingsTab from './restaurants/RestaurantBookingsTab';
import RestaurantMenusTab from './restaurants/RestaurantMenusTab';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from '@/pages/admin/components/events/EventForm';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { useEvents } from '@/hooks/useEvents';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { useHotelPath } from '@/hooks/useHotelPath';
import InlineReservationsPanel from '@/components/admin/restaurants/InlineReservationsPanel';

const RestaurantManager = () => {
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();
  const queryClient = useQueryClient();
  const { restaurants, isLoading, deleteRestaurant } = useRestaurants();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('restaurants');
  const { markSectionSeen } = useAdminNotifications();
  const [selectedRestaurantForReservations, setSelectedRestaurantForReservations] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'bookings') {
      markSectionSeen('restaurants');
    }
  }, [activeTab, markSectionSeen]);

  // State for add event dialog
  const [addEventRestaurantId, setAddEventRestaurantId] = useState<string | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  const { createEvent } = useEvents();


  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    } catch (error) {
      console.error('Error refreshing restaurants:', error);
      toast.error('Failed to refresh restaurants');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDialogOpen(true);
  };

  const handleDeleteRestaurant = async (id) => {
    try {
      await deleteRestaurant(id);
      toast.success('Restaurant deleted successfully');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Failed to delete restaurant');
    }
  };

  const handleDialogClose = (success = false) => {
    setIsDialogOpen(false);
    setSelectedRestaurant(null);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    }
  };

  const navigateToReservations = (restaurantId) => {
    setSelectedRestaurantForReservations(restaurantId);
  };

  const navigateToMenus = (restaurantId) => {
    navigate(resolvePath(`/admin/restaurant-menus?restaurantId=${restaurantId}`));
  };

  // Handle add event
  const handleAddEvent = (restaurant) => {
    setAddEventRestaurantId(restaurant.id);
    setIsAddEventOpen(true);
  };

  // On event submit, create event and close dialog
  const handleEventSubmit = async (data) => {
    await createEvent({ ...data, restaurant_id: addEventRestaurantId });
    setIsAddEventOpen(false);
    setAddEventRestaurantId(null);
    toast.success('Event created and linked to restaurant!');
  };

  const refreshRestaurantData = () => {
    queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    queryClient.invalidateQueries({ queryKey: ['table-reservations'] });
    queryClient.invalidateQueries({ queryKey: ['menuItems'] });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Utensils className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Restaurant Management</h1>
          <p className="text-sm text-muted-foreground">Manage restaurants, bookings, and menus</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurants">
          <Card>
            {!selectedRestaurantForReservations && (
              <CardHeader>
                <CardTitle>Restaurants</CardTitle>
                <CardDescription>
                  Manage restaurant listings and information
                </CardDescription>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Restaurant
                  </Button>
                </div>
              </CardHeader>
            )}
            <CardContent>
              {isLoading || isRefreshing ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : selectedRestaurantForReservations ? (
                <InlineReservationsPanel
                  restaurantId={selectedRestaurantForReservations}
                  restaurantName={restaurants?.find(r => r.id === selectedRestaurantForReservations)?.name || 'Restaurant'}
                  onBack={() => setSelectedRestaurantForReservations(null)}
                />
              ) : (
                <RestaurantTable
                  restaurants={restaurants || []}
                  onEdit={handleEditRestaurant}
                  onDelete={handleDeleteRestaurant}
                  onViewReservations={navigateToReservations}
                  onViewMenus={navigateToMenus}
                  onAddEvent={handleAddEvent}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Bookings</CardTitle>
              <CardDescription>
                Manage table reservations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestaurantBookingsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menus">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Menus</CardTitle>
              <CardDescription>
                Manage menu items for each restaurant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestaurantMenusTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RestaurantFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={handleDialogClose}
        restaurant={selectedRestaurant}
      />

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event to Restaurant</DialogTitle>
          </DialogHeader>
          <EventForm
            initialData={{ restaurant_id: addEventRestaurantId }}
            onSubmit={handleEventSubmit}
            onCancel={() => setIsAddEventOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantManager;
