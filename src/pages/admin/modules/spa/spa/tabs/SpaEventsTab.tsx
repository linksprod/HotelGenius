
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Event } from '@/types/event';
import { SpaFacility } from '@/features/spa/types';
import SpaEventsList from '../components/SpaEventsList';

interface SpaEventsTabProps {
  events: Event[];
  loading: boolean;
  onAddEvent: () => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
  facilities: SpaFacility[];
  onViewReservations?: (event: Event) => void; // NEW
}

const SpaEventsTab: React.FC<SpaEventsTabProps> = ({
  events,
  loading,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  facilities,
  onViewReservations // NEW
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Événements du Spa</CardTitle>
        <Button 
          onClick={onAddEvent}
          className="bg-[#00AEBB]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un événement
        </Button>
      </CardHeader>
      <CardContent>
        <SpaEventsList
          events={events}
          onEditEvent={onEditEvent}
          onDeleteEvent={onDeleteEvent}
          isLoading={loading}
          onViewReservations={onViewReservations} // propagate
          facilities={facilities}
        />
      </CardContent>
    </Card>
  );
};

export default SpaEventsTab;  
