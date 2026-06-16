import React from 'react';
import { useTranslation } from 'react-i18next';
import { Restaurant } from '@/features/dining/types';
import { translateOpenHours } from '@/utils/restaurantTranslation';

interface AboutRestaurantProps {
  restaurant: Restaurant;
}

const AboutRestaurant = ({ restaurant }: AboutRestaurantProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="prose max-w-none">
      <h2 className="text-2xl font-semibold mb-4">{t('dining.about.title', 'À propos de {{name}}', { name: restaurant.name })}</h2>
      <p className="text-gray-700">{t(`restaurants.description.${restaurant.id}`, restaurant.description)}</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-3">{t('dining.about.hours', "Heures d'ouverture")}</h3>
      <p className="text-gray-700">{translateOpenHours(t(`restaurants.openHours.${restaurant.id}`, restaurant.openHours), i18n.language)}</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-3">{t('dining.about.location', "Emplacement")}</h3>
      <p className="text-gray-700">{t(`restaurants.location.${restaurant.location}`, restaurant.location)}</p>
    </div>
  );
};

export default AboutRestaurant;
