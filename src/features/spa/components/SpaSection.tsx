
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import SpaServiceCard from './SpaServiceCard';
import { useSpaServices } from '@/hooks/useSpaServices';
import { ChevronRight } from 'lucide-react';
import SwipeIndicator from '@/components/ui/swipe-indicator';

interface SpaSectionProps {
  onBookService: (serviceId: string) => void;
}

const SpaSection = ({
  onBookService
}: SpaSectionProps) => {
  const { t } = useTranslation();
  const { services, isLoading } = useSpaServices();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [api, setApi] = React.useState<any>(null);

  React.useEffect(() => {
    if (!api) return;
    api.on('select', () => {
      setSelectedIndex(api.selectedScrollSnap());
    });
    setSelectedIndex(api.selectedScrollSnap());
  }, [api]);

  if (isLoading) {
    return <div className="text-center py-8">{t('spa.loading_services', 'Loading services...')}</div>;
  }

  const displayServices = services?.slice(0, 6) || [];

  return (
    <div className="mb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">{t('spa.services_title', 'Spa Services')}</h2>
        <p className="text-muted-foreground">
          {t('spa.services_subtitle', 'Discover our range of relaxing and rejuvenating treatments')}
        </p>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true
        }}
        className="w-full"
      >
        <CarouselContent>
          {displayServices.map((service) => (
            <CarouselItem key={service.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
              <SpaServiceCard
                service={service}
                onBook={() => onBookService(service.id)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-end gap-2 mt-4">
          <CarouselPrevious className="static transform-none" />
          <CarouselNext className="static transform-none" />
        </div>
        <div className="mt-4 flex justify-center">
          <SwipeIndicator
            selectedIndex={selectedIndex}
            totalSlides={displayServices.length}
          />
        </div>
      </Carousel>
    </div>
  );
};

export default SpaSection;
