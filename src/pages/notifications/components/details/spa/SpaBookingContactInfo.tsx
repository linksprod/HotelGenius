
import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Home, FileText } from 'lucide-react';

interface SpaBookingContactInfoProps {
  booking: {
    guest_name: string;
    guest_email: string;
    guest_phone?: string;
    room_number?: string;
    special_requests?: string;
  };
}

export const SpaBookingContactInfo: React.FC<SpaBookingContactInfoProps> = ({ booking }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <h3 className="font-medium">{t('notifications.spaBooking.contactInfo')}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <p className="font-medium">{t('notifications.spaBooking.name')}</p>
            <p className="text-gray-600">{booking.guest_name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-gray-500" />
          <div>
            <p className="font-medium">{t('notifications.spaBooking.email')}</p>
            <p className="text-gray-600">{booking.guest_email}</p>
          </div>
        </div>
        
        {booking.guest_phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">{t('notifications.spaBooking.phone')}</p>
              <p className="text-gray-600">{booking.guest_phone}</p>
            </div>
          </div>
        )}
        
        {booking.room_number && (
          <div className="flex items-center gap-2 text-sm">
            <Home className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">{t('notifications.spaBooking.room')}</p>
              <p className="text-gray-600">{booking.room_number}</p>
            </div>
          </div>
        )}
      </div>
      
      {booking.special_requests && (
        <div className="flex items-start gap-2 text-sm mt-4">
          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium">{t('notifications.spaBooking.specialRequests')}</p>
            <p className="text-gray-600">{booking.special_requests}</p>
          </div>
        </div>
      )}
    </div>
  );
};
