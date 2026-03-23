
import React, { useState } from 'react';
import { useSpaFacilities } from '@/hooks/useSpaFacilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, List } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import SpaFacilityDialog from './SpaFacilityDialog';
import SpaEventsDialog from './SpaEventsDialog';
import SpaEventsList from './SpaEventsList';
import { Event } from '@/types/event';
import { SpaFacility } from '@/features/spa/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpaEventsManager from './SpaEventsManager';

const SpaFacilitiesTab = () => {
  const { facilities, isLoading } = useSpaFacilities();
  const [selectedFacility, setSelectedFacility] = useState<SpaFacility | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { events, loading: eventsLoading, deleteEvent } = useEvents();
  const [activeTab, setActiveTab] = useState<'facilities' | 'events'>('facilities');

  const handleEditFacility = (facility: SpaFacility) => {
    setSelectedFacility(facility);
    setIsDialogOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleDeleteEvent = (event: Event) => {
    deleteEvent(event.id);
  };

  const handleDialogClose = (success: boolean) => {
    setIsDialogOpen(false);
    // You could add additional logic here if needed when the dialog is closed
  };

  const filteredEvents = events?.filter(event => event.spa_facility_id === selectedFacility?.id) || [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="facilities" value={activeTab} onValueChange={(value) => setActiveTab(value as 'facilities' | 'events')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          {activeTab === 'facilities' && (
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              Add Facility
            </Button>
          )}
        </div>

        <TabsContent value="facilities">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {facilities?.map((facility) => (
              <Card key={facility.id} className="p-6">
                <div className="relative aspect-video mb-4">
                  <img
                    src={facility.image_url || '/placeholder.svg'}
                    alt={facility.name}
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{facility.name}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{facility.description}</p>
                <div className="flex justify-between items-center gap-2">
                  <Button variant="outline" onClick={() => handleEditFacility(facility)} className="flex-1 bg-card dark:bg-zinc-800 border-border dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-foreground font-bold h-10 rounded-xl">
                    Edit
                  </Button>
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 rounded-xl shadow-lg shadow-primary/10"
                    onClick={() => {
                      setSelectedFacility(facility);
                      handleAddEvent();
                    }}
                  >
                    Add Event
                  </Button>
                </div>

                {selectedFacility?.id === facility.id && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <h4 className="text-lg font-bold text-foreground mb-4">Events</h4>
                    <SpaEventsList 
                      events={filteredEvents}
                      onEditEvent={handleEditEvent}
                      onDeleteEvent={handleDeleteEvent}
                      isLoading={eventsLoading}
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <SpaEventsManager />
        </TabsContent>
      </Tabs>

      <SpaFacilityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        facility={selectedFacility}
        onClose={handleDialogClose}
      />

      {selectedFacility && (
        <SpaEventsDialog
          open={isEventDialogOpen}
          onOpenChange={setIsEventDialogOpen}
          facility={selectedFacility}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default SpaFacilitiesTab;
