
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';

interface BookingDateInfoProps {
  date: string;
  time: string;
}

const BookingDateInfo: React.FC<BookingDateInfoProps> = ({ date, time }) => {
  const { t, i18n } = useTranslation();
  let formattedDate;
  
  try {
    if (!date) {
      throw new Error('Date is undefined or null');
    }
    
    const parsedDate = parseISO(date);
    
    if (!isValid(parsedDate)) {
      throw new Error('Invalid date format');
    }
    
    formattedDate = format(parsedDate, 'PPPP', { locale: i18n.language === 'fr' ? fr : enUS });
  } catch (error) {
    console.error('Error parsing date:', error, 'Original date value:', date);
    formattedDate = date || t('spa.bookingDetails.date.dateUnavailable', 'Date unavailable');
  }
  
  return (
    <div className="space-y-3">
      <h3 className="font-medium">{t('spa.bookingDetails.date.title', 'Booking Details')}</h3>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-gray-500" />
        <div>
          <p className="font-medium">{t('spa.bookingDetails.date.dateTime', 'Date and time')}</p>
          <p className="text-gray-600">
            {formattedDate}
            {time ? ` ${t('spa.bookingDetails.date.at', 'at')} ${time}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingDateInfo;
