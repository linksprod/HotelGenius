
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UtensilsCrossed, Heart, Phone, Info } from 'lucide-react';
import ServiceCard from './ServiceCard';
import { useLocation } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';

const MainServicesSection = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { resolvePath } = useHotelPath();
  const isAdmin = location.pathname.includes('/admin');

  return (
    <section className="px-4 sm:px-6 mb-8 sm:mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t('home.services.mainServicesTitle')}</h2>
        {/* Admin button to edit About page */}
        {!isAdmin}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <ServiceCard
          icon={<Info className="w-full h-full" />}
          title={t('home.services.aboutUs')}
          description={t('home.services.aboutUsDescription')}
          actionText={t('common.viewAll')}
          actionLink={resolvePath("/about")}
          status={t('common.available')}
        />

        <ServiceCard
          icon={<UtensilsCrossed className="w-full h-full" />}
          title={t('home.services.gastronomy')}
          description={t('home.services.gastronomyDescription')}
          actionText={t('common.reserveTable')}
          actionLink={resolvePath("/dining")}
          status={t('common.open')}
        />

        <ServiceCard
          icon={<Phone className="w-full h-full" />}
          title={t('home.services.concierge')}
          description={t('home.services.conciergeDescription')}
          actionText={t('common.contactNow')}
          actionLink={resolvePath("/services")}
          status={t('common.available')}
        />

        <ServiceCard
          icon={<Heart className="w-full h-full" />}
          title={t('home.services.spaWellness')}
          description={t('home.services.spaWellnessDescription')}
          actionText={t('common.bookTreatment')}
          actionLink={resolvePath("/spa")}
          status={t('common.available')}
        />
      </div>
    </section>
  );
};

export default MainServicesSection;
