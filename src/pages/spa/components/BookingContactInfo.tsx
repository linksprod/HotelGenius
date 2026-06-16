
import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Home, FileText } from 'lucide-react';
import { SpaBooking } from '@/features/spa/types';

interface BookingContactInfoProps {
  booking: SpaBooking;
}

const BookingContactInfo: React.FC<BookingContactInfoProps> = ({ booking }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <h3 className="font-medium">{t('spa.bookingDetails.contact.title', 'Contact Information')}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <p className="font-medium">{t('spa.bookingDetails.contact.name', 'Name')}</p>
            <p className="text-gray-600">{booking.guest_name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-gray-500" />
          <div>
            <p className="font-medium">{t('spa.bookingDetails.contact.email', 'Email')}</p>
            <p className="text-gray-600">{booking.guest_email}</p>
          </div>
        </div>
        
        {booking.guest_phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">{t('spa.bookingDetails.contact.phone', 'Phone')}</p>
              <p className="text-gray-600">{booking.guest_phone}</p>
            </div>
          </div>
        )}
        
        {booking.room_number && (
          <div className="flex items-center gap-2 text-sm">
            <Home className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">{t('spa.bookingDetails.contact.room', 'Room')}</p>
              <p className="text-gray-600">{booking.room_number}</p>
            </div>
          </div>
        )}
      </div>
      
      {booking.special_requests && (
        <div className="flex items-start gap-2 text-sm mt-4">
          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium">{t('spa.bookingDetails.contact.specialRequests', 'Special Requests')}</p>
            <p className="text-gray-600">{booking.special_requests}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingContactInfo;
