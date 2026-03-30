import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Utensils, LayoutGrid, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurants } from '@/hooks/useRestaurants';
import { RestaurantTable } from '@/components/admin/restaurants/RestaurantTable';
import RestaurantFormDialog from '@/components/admin/restaurants/RestaurantFormDialog';
import RestaurantBookingsTab from './restaurants/RestaurantBookingsTab';
import RestaurantMenusTab from './restaurants/RestaurantMenusTab';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import DemoInstructionOverlay from '@/components/admin/DemoInstructionOverlay';
import EventForm from '@/pages/admin/components/events/EventForm';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};
import { useEvents } from '@/hooks/useEvents';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { useHotelPath } from '@/hooks/useHotelPath';
import InlineReservationsPanel from '@/components/admin/restaurants/InlineReservationsPanel';

const RestaurantCard = ({ restaurant, onEdit, onDelete, onViewReservations, onViewMenus, onAddEvent }) => {
  // Simulated live data for demo
  const occupancy = Math.floor(Math.random() * 40) + 60; // 60-99%
  const isBusy = occupancy > 85;
  
  return (
    <Card className="overflow-hidden bg-card dark:bg-zinc-900 border-border dark:border-white/5 group hover:border-amber-500/50 transition-all shadow-sm dark:shadow-2xl relative">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop'} 
          alt={restaurant.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold">OPEN</Badge>
          {isBusy && (
            <div className="px-2 py-1 rounded-md bg-rose-500/20 backdrop-blur-md border border-rose-500/30 flex items-center gap-1.5 transition-all animate-pulse">
              <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Busy Trend</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Live Occupancy</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white">{occupancy}%</span>
              <div className="h-1 w-1 rounded-full bg-emerald-500 mb-1" />
            </div>
          </div>
          
          {/* Mini Sparkline SVG */}
          <div className="h-8 w-20 opacity-50 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 100 40" className="h-full w-full">
              <path
                d="M0 35 L10 32 L20 38 L30 25 L40 28 L50 15 L60 22 L70 10 L80 18 L90 5 L100 12"
                fill="none"
                stroke={isBusy ? "#f43f5e" : "#10b981"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground mb-1">{restaurant.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{restaurant.description || 'Premium dining experience with curated seasonal ingredients.'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewReservations(restaurant.id)} className="bg-card dark:bg-zinc-800 border-border dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-foreground text-[10px] font-bold h-9">Bookings</Button>
          <Button variant="outline" size="sm" onClick={() => onViewMenus(restaurant.id)} className="bg-card dark:bg-zinc-800 border-border dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-foreground text-[10px] font-bold h-9">Menus</Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(restaurant)} className="bg-card dark:bg-zinc-800 border-border dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-foreground text-[10px] font-bold h-9">Settings</Button>
          <Button variant="outline" size="sm" onClick={() => onAddEvent(restaurant)} className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 text-[10px] font-bold h-9">Add Event</Button>
        </div>
      </CardContent>
    </Card>
  );
};

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { markSectionSeen } = useAdminNotifications();
  const [selectedRestaurantForReservations, setSelectedRestaurantForReservations] = useState<string | null>(null);

  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo/');

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
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">

      <motion.div 
        className="flex-1 flex flex-col min-h-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Area */}
        <motion.div 
          id="admin-ob-restaurants-header"
          variants={itemVariants} 
          className="shrink-0 p-8 pb-4 flex items-center justify-between"
        >
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Culinary Experience</h1>
            <p className="text-muted-foreground font-medium text-sm">Manage restaurants, bookings, and menus</p>
          </div>
          
          <div id="admin-ob-restaurants-actions" className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-11 px-4 bg-card dark:bg-zinc-900 border-border dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground rounded-xl transition-all"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="h-12 px-6 rounded-xl bg-foreground dark:bg-white text-background dark:text-black hover:bg-foreground/90 dark:hover:bg-zinc-200 font-bold border-none shadow-xl transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Venue
            </Button>
          </div>
        </motion.div>

        {/* Tabs Content */}
        <div className="flex-1 min-h-0 px-8 pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <TabsList id="admin-ob-restaurants-tabs" className="bg-card dark:bg-zinc-900/50 rounded-xl p-1 h-11 border border-border dark:border-white/5">
                <TabsTrigger value="restaurants" className="px-6 text-[10px] font-bold uppercase tracking-tight data-[state=active]:bg-rose-500 data-[state=active]:text-primary-foreground rounded-lg">Venues</TabsTrigger>
                <TabsTrigger value="bookings" className="px-6 text-[10px] font-bold uppercase tracking-tight data-[state=active]:bg-rose-500 data-[state=active]:text-primary-foreground rounded-lg">Reservations</TabsTrigger>
                <TabsTrigger value="menus" className="px-6 text-[10px] font-bold uppercase tracking-tight data-[state=active]:bg-rose-500 data-[state=active]:text-primary-foreground rounded-lg">Menus</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="restaurants" className="flex-1 m-0 overflow-hidden focus-visible:outline-none">
              <ScrollArea className="h-full">
                <motion.div variants={itemVariants} className="space-y-6 pb-8">
                  {selectedRestaurantForReservations ? (
                    <Card className="bg-card/30 dark:bg-zinc-900/30 backdrop-blur-xl border border-border dark:border-white/[0.03] rounded-[2rem] overflow-hidden">
                      <InlineReservationsPanel
                        restaurantId={selectedRestaurantForReservations}
                        restaurantName={restaurants?.find(r => r.id === selectedRestaurantForReservations)?.name || 'Restaurant'}
                        onBack={() => setSelectedRestaurantForReservations(null)}
                      />
                    </Card>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(restaurants || []).map(r => (
                        <motion.div key={r.id} variants={itemVariants}>
                          <RestaurantCard 
                            restaurant={r}
                            onEdit={handleEditRestaurant}
                            onDelete={handleDeleteRestaurant}
                            onViewReservations={navigateToReservations}
                            onViewMenus={navigateToMenus}
                            onAddEvent={handleAddEvent}
                          />
                        </motion.div>
                      ))}
                      <Card 
                        className="border-dashed border-2 border-border dark:border-white/5 bg-transparent hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-center p-12 group rounded-[2rem]"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <div className="text-center space-y-2">
                          <Plus className="h-6 w-6 text-muted-foreground group-hover:text-amber-500 mx-auto" />
                          <p className="text-sm font-bold text-muted-foreground">Add New Venue</p>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <Card className="bg-card/30 dark:bg-zinc-900/30 backdrop-blur-xl border border-border dark:border-white/[0.03] rounded-[2rem] overflow-hidden">
                      <RestaurantTable
                        restaurants={restaurants || []}
                        onEdit={handleEditRestaurant}
                        onDelete={handleDeleteRestaurant}
                        onViewReservations={navigateToReservations}
                        onViewMenus={navigateToMenus}
                        onAddEvent={handleAddEvent}
                      />
                    </Card>
                  )}
                </motion.div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="bookings" className="flex-1 m-0 overflow-hidden focus-visible:outline-none">
              <ScrollArea className="h-full">
                <motion.div variants={itemVariants}>
                  <Card className="bg-card/30 dark:bg-zinc-900/30 backdrop-blur-xl border border-border dark:border-white/[0.03] rounded-[2rem] overflow-hidden">
                    <RestaurantBookingsTab />
                  </Card>
                </motion.div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="menus" className="flex-1 m-0 overflow-hidden focus-visible:outline-none">
              <ScrollArea className="h-full">
                <motion.div variants={itemVariants}>
                  <Card className="bg-card/30 dark:bg-zinc-900/30 backdrop-blur-xl border border-border dark:border-white/[0.03] rounded-[2rem] overflow-hidden">
                    <RestaurantMenusTab />
                  </Card>
                </motion.div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      <RestaurantFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={handleDialogClose}
        restaurant={selectedRestaurant}
      />

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="bg-card dark:bg-zinc-900 border-border dark:border-white/5 text-foreground">
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
