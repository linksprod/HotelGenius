
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Event } from '@/types/event';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EventCalendarDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  events: Event[];
}

const EventCalendarDialog = ({ isOpen, onOpenChange, events }: EventCalendarDialogProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const dateLocale = currentLang === 'fr' ? fr : enUS;
  // Create a map of dates to events
  const eventsByDate = events.reduce((acc: Record<string, Event[]>, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  // Function to render event indicators for each date
  const modifiers = {
    event: (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return dateStr in eventsByDate;
    }
  };

  const modifiersStyles = {
    event: { color: 'white', backgroundColor: 'hsl(var(--primary))' }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('events.calendar.title', 'Event Calendar')}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Calendar
            mode="single"
            className={cn("p-3 pointer-events-auto")}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            locale={dateLocale}
            footer={
              <div className="mt-4 space-y-2">
                {Object.entries(eventsByDate).map(([date, dateEvents]) => (
                  <div key={date} className="flex flex-col gap-1">
                    <div className="font-semibold">
                      {format(new Date(date), 'd MMMM yyyy', { locale: dateLocale })}
                    </div>
                    {dateEvents.map(event => (
                      <div key={event.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{event.time || t('events.calendar.allDay', 'All day')}</Badge>
                        {event.title}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventCalendarDialog;
