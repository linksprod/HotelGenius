
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EventBookingCard } from './EventBookingCard';
import { Event } from '@/types/event';

interface EventsSectionProps {
  events: Event[];
}

export const EventsSection = ({ events }: EventsSectionProps) => {
  const { t } = useTranslation();
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('events.noUpcomingEvents', 'No upcoming events')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <EventBookingCard key={event.id} event={event} />
      ))}
    </div>
  );
};
