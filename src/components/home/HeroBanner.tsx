
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHotelConfig } from '@/hooks/useHotelConfig';

const HeroBanner = () => {
  const { t } = useTranslation();
  const { config, isLoading } = useHotelConfig();

  const defaultImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
  
  if (isLoading && !config) {
    return <div className="h-64 rounded-b-3xl bg-muted animate-pulse" />;
  }

  const heroImage = config?.home_hero_image || defaultImage;
  const heroTitle = config?.home_hero_title || t('home.hero.stayGuideTitle');
  const heroSubtitle = config?.home_hero_subtitle || t('home.hero.stayGuideSubtitle');

  return (
    <div className="relative h-64 overflow-hidden rounded-b-3xl">
      <img 
        src={heroImage} 
        alt={t('home.hero.stayGuideTitle', 'Hotel Exterior')} 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
      <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{heroTitle}</h1>
        <p className="text-xl mb-6 opacity-95">{heroSubtitle}</p>
      </div>
    </div>
  );
};

export default HeroBanner;
