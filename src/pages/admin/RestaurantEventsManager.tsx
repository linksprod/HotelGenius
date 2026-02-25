
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useEvents } from '@/hooks/useEvents';
import RestaurantEventsDialog from '@/pages/admin/components/restaurants/RestaurantEventsDialog';
import EventReservationsTab from './components/restaurant-events/EventReservationsTab';
import RestaurantEventsList from './components/restaurant-events/RestaurantEventsList';

const RestaurantEventsManager = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const { fetchRestaurantById } = useRestaurants();
  const { events, loading: eventsLoading, refetch, deleteEvent } = useEvents();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  const loadRestaurant = async () => {
    if (!id) return;
    try {
      const data = await fetchRestaurantById(id);
      setRestaurant(data);
    } catch (error) {
      console.error('Error loading restaurant:', error);
      toast.error('Unable to load restaurant details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success('Events refreshed');
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setIsAddEventOpen(true);
  };

  const handleDeleteEvent = async (event: any) => {
    try {
      await deleteEvent(event.id);
      toast.success('Event deleted successfully');
      await refetch();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const filteredEvents = events?.filter(event => event.restaurant_id === id) || [];

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-8">
        <p>Restaurant not found</p>
        <Button onClick={() => navigate(resolvePath('/admin/restaurants'))}>Back to Restaurants</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(resolvePath('/admin/restaurants'))}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-semibold ml-4">{restaurant.name} - Events Management</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 mr-2 ${eventsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsAddEventOpen(true)}>
            Add Event
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events & Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="events">
            <TabsList className="mb-4">
              <TabsTrigger value="events">Events List</TabsTrigger>
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <RestaurantEventsList
                events={filteredEvents}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                isLoading={eventsLoading}
              />
            </TabsContent>

            <TabsContent value="reservations">
              <EventReservationsTab restaurantId={id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <RestaurantEventsDialog
        isOpen={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        restaurant={restaurant}
        event={selectedEvent}
      />
    </div>
  );
};

export default RestaurantEventsManager;
