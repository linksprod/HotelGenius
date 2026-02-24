
import React from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventBookingCard } from '@/components/events/EventBookingCard';
import { Card, CardContent } from '@/components/ui/card';

const SpaEventsSection = () => {
  const { events, loading } = useEvents(true); // true to filter by spa events only

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Spa Events</h2>
        <p className="text-muted-foreground">
          Discover our special spa events and wellness activities
        </p>
      </div>

      <div className="space-y-6">
        {events.map((event) => (
          <EventBookingCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default SpaEventsSection;
