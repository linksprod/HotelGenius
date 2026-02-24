
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Wine, Calendar, MapPin } from 'lucide-react';
import { useTodayHighlights } from '@/hooks/useTodayHighlights';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useHotelPath } from '@/hooks/useHotelPath';

const TodayHighlightsSection = () => {
  const { t } = useTranslation();
  const { todayEvents, loading } = useTodayHighlights();
  const { resolvePath } = useHotelPath();

  if (loading) {
    return (
      <section className="px-6 mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('home.todayEvents.title')}</h2>
        <div className="grid grid-cols-1 gap-4">
          <Card className="overflow-hidden">
            <div className="flex items-center">
              <Skeleton className="w-1/3 h-32" />
              <div className="p-4 flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="flex items-center">
              <Skeleton className="w-1/3 h-32" />
              <div className="p-4 flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  if (todayEvents.length === 0) {
    return (
      <section className="px-6 mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('home.todayEvents.title')}</h2>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">{t('home.todayEvents.noEvents')}</p>
          <Link to={resolvePath("/events")}>
            <Button variant="link" className="mt-2">
              {t('home.todayEvents.viewAllEvents')}
            </Button>
          </Link>
        </Card>
      </section>
    );
  }

  return (
    <section className="px-6 mb-10">
      <h2 className="text-2xl font-bold text-foreground mb-4">{t('home.todayEvents.title')}</h2>
      <div className="grid grid-cols-1 gap-4">
        {todayEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="flex items-center">
              <div className="relative w-1/3 h-32">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {event.category === 'event' ? (
                      <Calendar className="w-5 h-5 text-primary" />
                    ) : (
                      <Wine className="w-5 h-5 text-primary" />
                    )}
                    <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{t('common.today')}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  {event.time} {event.location && `- ${event.location}`}
                </p>
                <Link to={resolvePath("/events")}>
                  <Button size="sm" className="w-full sm:w-auto">
                    {event.category === 'event' ? t('common.book') : t('common.viewOffer')}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TodayHighlightsSection;
