
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock } from 'lucide-react';

interface SpaBookingFacilityInfoProps {
  facility: {
    name: string;
    location: string;
    opening_hours?: string;
  } | null;
}

export const SpaBookingFacilityInfo: React.FC<SpaBookingFacilityInfoProps> = ({ facility }) => {
  const { t } = useTranslation();
  if (!facility) {
    return (
      <div className="space-y-3">
        <h3 className="font-medium">{t('notifications.spaBooking.facilityDetails')}</h3>
        <p className="text-sm text-gray-500">{t('notifications.spaBooking.facilityNotAvailable')}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h3 className="font-medium">{t('notifications.spaBooking.facilityDetails')}</h3>
      <div className="flex items-start gap-2 text-sm">
        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
        <div>
          <p className="font-medium">{facility.name}</p>
          <p className="text-gray-600">{facility.location}</p>
        </div>
      </div>
      
      {facility.opening_hours && (
        <div className="flex items-start gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium">{t('notifications.spaBooking.openingHours')}</p>
            <p className="text-gray-600">{facility.opening_hours}</p>
          </div>
        </div>
      )}
    </div>
  );
};
