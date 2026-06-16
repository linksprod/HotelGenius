
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/types/event';
import EventBookingDialog from '@/components/events/EventBookingDialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useHotel } from '@/features/hotels/context/HotelContext';

const Events = () => {
  const { t, i18n } = useTranslation();
  const { events, loading } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { toast } = useToast();
  const { requireAuth } = useRequireAuth();
  const { hotel } = useHotel();

  const handleBookEvent = (event: Event) => {
    requireAuth(() => {
      setSelectedEvent(event);
      setIsBookingOpen(true);
    });
  };

  const handleReservationSuccess = () => {
    setIsBookingOpen(false);
    toast({
      title: t('status.confirmed'),
      description: t('events.registerEvent'),
    });
  };

  const formatEventDate = (event: Event) => {
    if (event.recurrence_type === 'daily') return t('events.availableDaily', 'Available Daily');
    if (event.recurrence_type === 'weekly') return t('events.availableWeekly', 'Available Weekly');
    if (event.recurrence_type === 'monthly') return t('events.availableMonthly', 'Available Monthly');
    if (event.date) {
      const currentLang = i18n.language;
      const dateLocale = currentLang === 'fr' ? fr : enUS;
      return format(new Date(event.date), 'dd MMMM yyyy', { locale: dateLocale });
    }
    return t('events.dateTbd', 'Date TBD');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('events.title', 'Events & Promotions')}
          </h1>
          <p className="text-muted-foreground">
            {t('events.subtitle', 'Discover our special events and exclusive offers')}
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t('events.noEvents', 'No events available at the moment')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  {event.is_featured && (
                    <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                      {t('common.featured', 'Featured')}
                    </span>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Event Title */}
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {event.title}
                  </h3>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <span>{formatEventDate(event)}</span>
                    </div>

                    {event.time && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span>{event.time}</span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.capacity && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span>{t('events.spotsAvailable', '{{count}} spots available', { count: event.capacity })}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Book Button */}
                  {hotel?.plan !== 'essential' && (
                    <Button 
                      onClick={() => handleBookEvent(event)}
                      className="w-full"
                    >
                      {t('common.book', 'Book')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Event Booking Dialog */}
      {selectedEvent && (
        <EventBookingDialog
          isOpen={isBookingOpen}
          onOpenChange={setIsBookingOpen}
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          eventDate={selectedEvent.date}
          onSuccess={handleReservationSuccess}
          maxGuests={selectedEvent.capacity || 10}
        />
      )}
    </Layout>
  );
};

export default Events;
