
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import BookingDialog from '@/features/spa/components/SpaBookingDialog';
import SpaSection from '@/features/spa/components/SpaSection';
import SpaEventsSection from '@/features/spa/components/SpaEventsSection';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useHotel } from '@/features/hotels/context/HotelContext';

const Spa = () => {
  const { t } = useTranslation();
  const { requireAuth } = useRequireAuth();
  const { hotel } = useHotel();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleBookTreatment = (serviceId: string) => {
    requireAuth(() => {
      setSelectedService(serviceId);
      setIsBookingOpen(true);
    });
  };

  const handleBookingSuccess = () => {
    setIsBookingOpen(false);
  };

  return <Layout>
    <div className="text-center mb-8 pt-6 md:pt-8">
      <h1 className="text-4xl font-semibold text-foreground mb-4">{t('spa.title')}</h1>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        {t('spa.subtitle')}
      </p>
    </div>

    <SpaEventsSection />

    <SpaSection onBookService={handleBookTreatment} showBookingButton={hotel?.plan !== 'essential'} />

    {isBookingOpen && selectedService && <BookingDialog isOpen={isBookingOpen} onOpenChange={setIsBookingOpen} serviceId={selectedService} onSuccess={handleBookingSuccess} />}
  </Layout>;
};

export default Spa;
