
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Map, Compass, Star } from 'lucide-react';
import ServiceCard from './ServiceCard';

const AdditionalServicesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="px-6 mb-10">
      <h2 className="text-2xl font-bold text-foreground mb-4">{t('home.additionalServices.title')}</h2>
      <div className="grid grid-cols-2 gap-4">
        <ServiceCard
          icon={<ShoppingBag className="w-6 h-6 text-primary" />}
          title={t('home.additionalServices.shops')}
          description={t('home.additionalServices.shopsDescription')}
          actionText={t('common.shopNow')}
          actionLink="/shops"
          status={t('common.open')}
        />

        <ServiceCard
          icon={<Map className="w-6 h-6 text-primary" />}
          title={t('home.additionalServices.hotelMap')}
          description={t('home.additionalServices.hotelMapDescription')}
          actionText={t('common.openMap')}
          actionLink="/map"
          status={t('common.available')}
        />

        <ServiceCard
          icon={<Compass className="w-6 h-6 text-primary" />}
          title={t('home.additionalServices.destination')}
          description={t('home.additionalServices.destinationDescription')}
          actionText={t('common.explore')}
          actionLink="/destination"
          status={t('common.available')}
        />

        <ServiceCard
          icon={<Star className="w-6 h-6 text-primary" />}
          title={t('home.additionalServices.feedback')}
          description={t('home.additionalServices.feedbackDescription')}
          actionText={t('common.writeReview')}
          actionLink="/feedback"
          status={t('common.available')}
        />
      </div>
    </section>
  );
};

export default AdditionalServicesSection;
