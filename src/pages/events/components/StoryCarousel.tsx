
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event';
import { format } from 'date-fns';
import SwipeIndicator from '@/components/ui/swipe-indicator';
import { Skeleton } from '@/components/ui/skeleton';

interface StoryCarouselProps {
  events: Event[];
  loading: boolean;
  onBookEvent: (event: Event) => void;
}

export const StoryCarousel = ({ events, loading, onBookEvent }: StoryCarouselProps) => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Memoize filtered events to prevent unnecessary renders
  const filteredEvents = useMemo(() => {
    return events.slice(0, 5); // Limiter à 5 événements pour améliorer les performances
  }, [events]);

  const handleIntervalChange = useCallback(() => {
    if (!loading && filteredEvents.length > 0) {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % filteredEvents.length);
    }
  }, [loading, filteredEvents.length]);

  useEffect(() => {
    if (!loading && filteredEvents.length > 0) {
      const interval = setInterval(handleIntervalChange, 5000);
      return () => clearInterval(interval);
    }
  }, [loading, filteredEvents.length, handleIntervalChange]);

  if (loading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-[70vh] rounded-3xl w-full" />
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="h-[50vh] rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
        <p className="text-gray-500">{t('events.noEventsAvailable', 'No events available')}</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Carousel
        className="w-full"
        setApi={(api) => {
          if (api) {
            api.on("select", () => {
              const currentIndex = api.selectedScrollSnap();
              setSelectedIndex(currentIndex);
            });
          }
        }}
      >
        <CarouselContent>
          {filteredEvents.map((event) => (
            <CarouselItem key={event.id}>
              <div className="relative rounded-3xl overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-[70vh] object-cover"
                  loading="lazy" 
                  decoding="async"
                  fetchPriority="high"
                />
                <div className="absolute top-0 left-0 right-0 p-2">
                  <div className="flex space-x-1">
                    {filteredEvents.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 flex-1 rounded-full ${i === selectedIndex ? 'bg-white' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <span className="text-sm font-medium bg-primary/50 backdrop-blur-sm px-3 py-1 rounded-full mb-2 inline-block">
                    {event.category === 'event' ? t('events.categoryEvent', 'Event') : t('events.categoryPromotion', 'Promotion')}
                  </span>
                  <h1 className="text-2xl font-bold mb-1">{event.title}</h1>
                  <p className="mb-3">{event.description}</p>
                  <Button size="sm" onClick={() => onBookEvent(event)}>
                    {t('common.book', 'Book')}
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </div>
      </Carousel>
      <SwipeIndicator selectedIndex={selectedIndex} totalSlides={filteredEvents.length} />
    </div>
  );
};
