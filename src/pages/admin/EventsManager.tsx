
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PartyPopper } from 'lucide-react';
import { EventsTab } from './components/events/EventsTab';
import { StoriesTab } from './components/events/StoriesTab';
import { EventReservationsTab } from './components/events/EventReservationsTab';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';

const EventsManager = () => {
  const [selectedEventId, setSelectedEventId] = React.useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = React.useState('events');
  const { markSectionSeen } = useAdminNotifications();

  React.useEffect(() => {
    if (activeTab === 'reservations') {
      markSectionSeen('events');
    }
  }, [activeTab, markSectionSeen]);

  return (
    <div className="p-6">
      <div id="admin-ob-events-header" className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <PartyPopper className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Événements et Promotions</h1>
          <p className="text-sm text-muted-foreground">Gérez les événements, réservations et stories</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full bg-muted">
          <TabsTrigger value="events" className="flex-1 py-3">Événements</TabsTrigger>
          <TabsTrigger value="reservations" className="flex-1 py-3">Réservations</TabsTrigger>
          <TabsTrigger value="stories" className="flex-1 py-3">Stories</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <EventsTab />
        </TabsContent>

        <TabsContent value="reservations">
          <EventReservationsTab
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
          />
        </TabsContent>

        <TabsContent value="stories">
          <StoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventsManager;
