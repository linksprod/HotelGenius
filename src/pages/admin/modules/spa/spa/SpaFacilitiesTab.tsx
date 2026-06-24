
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
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const SpaFacilitiesTab = () => {
  const queryClient = useQueryClient();
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

  const handleTogglePublish = async (facility: SpaFacility) => {
    try {
      const { error } = await supabase
        .from('spa_facilities')
        .update({ is_published: !facility.is_published })
        .eq('id', facility.id);
        
      if (error) throw error;
      toast.success(facility.is_published ? 'Moved to Draft' : 'Published Successfully');
      queryClient.invalidateQueries({ queryKey: ['spa-facilities'] });
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredEvents = events?.filter(event => event.spa_facility_id === selectedFacility?.id) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Facilities</h3>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {facilities?.map((facility) => (
            <Card key={facility.id} className="p-6 relative">
              <div className="absolute top-8 right-8 z-10">
                <Badge 
                  className={`cursor-pointer border-none text-[10px] font-bold ${facility.is_published ? 'bg-accent/80 hover:bg-accent text-accent-foreground' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePublish(facility);
                  }}
                >
                  {facility.is_published ? 'PUBLISHED' : 'DRAFT'}
                </Badge>
              </div>
              <div className="relative aspect-video mb-4">
                <img
                  src={facility.image_url || '/placeholder.svg'}
                  alt={facility.name}
                  className="rounded-lg object-cover w-full h-full"
                />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{facility.name}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{facility.description}</p>
              <Button variant="outline" onClick={() => handleEditFacility(facility)} className="w-full bg-card dark:bg-zinc-800 border-border dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-foreground font-bold h-10 rounded-xl">
                Edit
              </Button>
            </Card>
          ))}
        </div>

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
