
import React, { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useSpaFacilities } from '@/hooks/useSpaFacilities';
import { Event, EventReservation } from '@/types/event';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpaEventsDialog from './SpaEventsDialog';
import { EventReservationDetail } from '@/pages/admin/components/events/EventReservationDetail';
import { useEventReservations } from '@/hooks/useEventReservations';
import SpaEventsTab from './tabs/SpaEventsTab';
import SpaEventReservationsTab from './tabs/SpaEventReservationsTab';

const SpaEventsManager = () => {
  const { events, loading, deleteEvent, refetch } = useEvents(true);
  const { facilities } = useSpaFacilities();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined);
  const { reservations, isLoading: reservationsLoading, updateReservationStatus } = useEventReservations(selectedEventId);
  const [selectedReservation, setSelectedReservation] = useState<EventReservation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'reservations'>('list'); // NEW

  const handleAddEvent = () => {
    if (facilities && facilities.length > 0 && !selectedFacility) {
      setSelectedFacility(facilities[0]);
    }
    setSelectedEvent(null);
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    const facility = facilities?.find(f => f.id === event.spa_facility_id);
    if (facility) {
      setSelectedFacility(facility);
      setSelectedEvent(event);
      setIsEventDialogOpen(true);
    }
  };

  const handleViewReservations = (event: Event) => {
    setSelectedEventId(event.id);
    setSelectedEvent(event);
    setActiveTab('reservations'); // Switch to reservations tab
  };

  const handleViewReservation = (reservation: EventReservation) => {
    setSelectedReservation(reservation);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = (reservationId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    updateReservationStatus({ id: reservationId, status });
  };

  const handleDeleteEvent = (event: Event) => {
    if (event && event.id) {
      deleteEvent(event.id);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} defaultValue="list" onValueChange={value => setActiveTab(value as 'list' | 'reservations')}>
        <TabsList>
          <TabsTrigger value="list">Liste des événements</TabsTrigger>
          {selectedEvent && (
            <TabsTrigger value="reservations">Réservations</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list">
          <SpaEventsTab
            events={events}
            loading={loading}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            facilities={facilities || []}
            onViewReservations={handleViewReservations}
          />
        </TabsContent>

        <TabsContent value="reservations">
          <SpaEventReservationsTab
            reservations={reservations}
            isLoading={reservationsLoading}
            onViewReservation={handleViewReservation}
            selectedEvent={selectedEvent}
          />
        </TabsContent>
      </Tabs>

      {selectedFacility && (
        <SpaEventsDialog
          open={isEventDialogOpen}
          onOpenChange={setIsEventDialogOpen}
          facility={selectedFacility}
          event={selectedEvent}
        />
      )}

      {selectedReservation && (
        <EventReservationDetail
          reservation={selectedReservation}
          onOpenChange={setIsDetailOpen}
          open={isDetailOpen}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={false}
        />
      )}
    </div>
  );
};

export default SpaEventsManager;
