
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Percent } from 'lucide-react';
import { Event } from '@/types/event';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface PromotionListProps {
  events: Event[];
  loading: boolean;
  onBookEvent: (event: Event) => void;
}

export const PromotionList = ({ events, loading, onBookEvent }: PromotionListProps) => {
  const { t } = useTranslation();
  // Memoize promotions to prevent unnecessary calculations
  const promotions = useMemo(() => {
    return events
      .filter(event => event.category === 'promo')
      .slice(0, 4); // Limiter à 4 promotions maximum pour la performance
  }, [events]);

  if (loading) {
    return (
      <>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-3" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-9 w-full" />
            </div>
          </Card>
        ))}
      </>
    );
  }

  if (promotions.length === 0) {
    return (
      <Card className="p-4 text-center col-span-2">
        <p className="text-gray-500">{t('events.noActivePromotions', 'No active promotions')}</p>
      </Card>
    );
  }

  return (
    <>
      {promotions.map(promo => (
        <Card key={promo.id} className="overflow-hidden">
          <div className="relative h-40">
            <img 
              src={promo.image} 
              alt={promo.title} 
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute top-0 left-0 bg-primary text-white text-xs font-bold px-3 py-1 m-3 rounded-full">
              <Percent className="h-3 w-3 inline mr-1" />
              {t('events.specialOffer', 'Special Offer')}
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{promo.title}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span>{t('events.validUntil', 'Valid until {{date}}', { date: format(new Date(promo.date), 'dd/MM/yyyy') })}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{promo.description}</p>
            <Button className="w-full" onClick={() => onBookEvent(promo)}>
              {t('events.viewDetails', 'View Details')}
            </Button>
          </div>
        </Card>
      ))}
    </>
  );
};
