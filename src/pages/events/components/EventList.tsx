
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Heart, Share } from 'lucide-react';
import { Event } from '@/types/event';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface EventListProps {
  events: Event[];
  loading: boolean;
  onBookEvent: (event: Event) => void;
}

export const EventList = ({ events, loading, onBookEvent }: EventListProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const dateLocale = currentLang === 'fr' ? fr : enUS;
  // Memoize filtered events to prevent unnecessary calculations
  const filteredEvents = useMemo(() => {
    return events
      .filter(event => event.category === 'event')
      .slice(0, 5); // Limiter à 5 événements pour la performance
  }, [events]);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="md:flex">
              <Skeleton className="md:w-1/3 h-48 md:h-auto" />
              <div className="p-6 md:w-2/3">
                <Skeleton className="h-7 w-3/4 mb-3" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-2/5" />
                </div>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-40" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <Card className="p-4 text-center">
        <p className="text-gray-500">{t('events.noUpcomingEvents', 'No upcoming events')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {filteredEvents.map(event => (
        <Card key={event.id} className="overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 h-48 md:h-auto relative">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-white/80">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-white/80">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 md:w-2/3">
              <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span>{format(new Date(event.date), 'dd MMMM yyyy', { locale: dateLocale })}</span>
                </div>
                {event.time && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span>{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  <span>{t('events.limitedSpots', 'Limited spots')}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="flex gap-3">
                <Button onClick={() => onBookEvent(event)}>{t('common.book', 'Book')}</Button>
                <Button variant="outline">{t('events.addToCalendar', 'Add to Calendar')}</Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
