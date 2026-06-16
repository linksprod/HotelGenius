
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SpaBookingDateInfoProps {
  date: string;
  time: string;
}

export const SpaBookingDateInfo: React.FC<SpaBookingDateInfoProps> = ({ date, time }) => {
  const { t } = useTranslation();
  let formattedDate;
  
  try {
    if (!date) {
      throw new Error('Date is undefined or null');
    }
    formattedDate = format(parseISO(date), 'PPPP', { locale: fr });
  } catch (error) {
    console.error('Error parsing date:', error, 'Original date value:', date);
    formattedDate = date || t('notifications.spaBooking.dateNotAvailable');
  }
  
  return (
    <div className="space-y-3">
      <h3 className="font-medium">{t('notifications.spaBooking.bookingDetails')}</h3>
      <ul className="space-y-2">
        <li className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{t('notifications.spaBooking.date')}: {formattedDate}</span>
        </li>
        {time && (
          <li className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{t('notifications.spaBooking.time')}: {time}</span>
          </li>
        )}
      </ul>
    </div>
  );
};
