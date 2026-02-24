
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import { useSpaServices } from '@/hooks/useSpaServices';
import BookingDialog from '@/features/spa/components/SpaBookingDialog';
import SpaSection from '@/features/spa/components/SpaSection';
import SpaEventsSection from '@/features/spa/components/SpaEventsSection';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const Spa = () => {
  const { t } = useTranslation();
  const { requireAuth } = useRequireAuth();
  const {
    featuredServices,
    isLoading
  } = useSpaServices();
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

    <SpaSection onBookService={handleBookTreatment} />

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {featuredServices && featuredServices.map(service => <Card key={service.id} className="overflow-hidden animate-fade-in">
        <img src={service.image || "/lovable-uploads/3cbdcf79-9da5-48bd-90f2-2c1737b76741.png"} alt={service.name} className="w-full h-48 object-cover" />
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-foreground">{service.name}</h3>
            <span className="text-primary font-semibold">${service.price}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span>{service.duration}</span>
          </div>
          <p className="text-muted-foreground mb-4">
            {service.description}
          </p>
          <Button className="w-full" onClick={() => handleBookTreatment(service.id)}>
            {t('spa.bookTreatment')}
          </Button>
        </div>
      </Card>)}
    </div>

    {isBookingOpen && selectedService && <BookingDialog isOpen={isBookingOpen} onOpenChange={setIsBookingOpen} serviceId={selectedService} onSuccess={handleBookingSuccess} />}
  </Layout>;
};

export default Spa;
