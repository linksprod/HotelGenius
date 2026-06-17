
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Building, Utensils, Coffee, LifeBuoy, Dumbbell, Wifi, DoorClosed, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useHotel } from '@/features/hotels/context/HotelContext';

const HOTEL_MAP_URLS: Record<string, string> = {
  'hotel-palais-bayram': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.9428852768983!2d10.168363375302805!3d36.79591976794172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd340a8d8d3e11%3A0x5b1adb83eaf0389c!2sBayram%20Palace%20-%20Palais%20Bayram!5e0!3m2!1sfr!2stn!4v1781701612322!5m2!1sfr!2stn',
  'palais-bayram': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.9428852768983!2d10.168363375302805!3d36.79591976794172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd340a8d8d3e11%3A0x5b1adb83eaf0389c!2sBayram%20Palace%20-%20Palais%20Bayram!5e0!3m2!1sfr!2stn!4v1781701612322!5m2!1sfr!2stn',
  'laico-hammamet': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3224.2384210631626!2d10.5348873!3d36.3671158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13029f6de31e21b7%3A0x9eb19a6bbf08dc78!2sLaico%20Hammamet!5e0!3m2!1sfr!2stn!4v1781701612322!5m2!1sfr!2stn'
};

const HotelMap = () => {
  const { t } = useTranslation();
  const { hotel } = useHotel();
  const [searchValue, setSearchValue] = useState('');

  const handleClearSearch = () => {
    setSearchValue('');
  };

  const getMapIframeUrl = () => {
    if (!hotel) return '';
    const slug = hotel.slug?.toLowerCase().trim();
    if (HOTEL_MAP_URLS[slug]) {
      return HOTEL_MAP_URLS[slug];
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(hotel.name)}&output=embed`;
  };

  const mapUrl = getMapIframeUrl();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="relative">
            <Input
              type="search"
              placeholder={t('mapPage.searchPlaceholder')}
              className="w-full pl-12 pr-10 py-4 rounded-xl text-base bg-card shadow-lg"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            {searchValue && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('mapPage.title')}</h2>
          <Card className="p-0 rounded-xl overflow-hidden mb-4 border border-border">
            <div className="w-full h-[450px]">
              {mapUrl ? (
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={hotel?.name || "Hotel Map"}
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                  {t('mapPage.loadingMap', 'Loading Map...')}
                </div>
              )}
            </div>
          </Card>

          {/* Floor Selector */}
          <div className="flex overflow-x-auto gap-2 pb-2 mb-4">
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">{t('mapPage.floors.ground')}</Button>
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">{t('mapPage.floors.floor1')}</Button>
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">{t('mapPage.floors.floor2')}</Button>
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">{t('mapPage.floors.floor3')}</Button>
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">{t('mapPage.floors.floor4')}</Button>
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">{t('mapPage.floors.floor5')}</Button>
          </div>
        </div>

        {/* Key Facilities */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('mapPage.keyFacilities.title')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Utensils className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{t('mapPage.keyFacilities.restaurants')}</h3>
                  <p className="text-sm text-muted-foreground">{t('mapPage.keyFacilities.restaurantsLocation')}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Coffee className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{t('mapPage.keyFacilities.cafe')}</h3>
                  <p className="text-sm text-muted-foreground">{t('mapPage.keyFacilities.cafeLocation')}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <LifeBuoy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{t('mapPage.keyFacilities.pool')}</h3>
                  <p className="text-sm text-muted-foreground">{t('mapPage.keyFacilities.poolLocation')}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{t('mapPage.keyFacilities.fitnessCenter')}</h3>
                  <p className="text-sm text-muted-foreground">{t('mapPage.keyFacilities.fitnessCenterLocation')}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Emergency Info */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('mapPage.emergency.title')}</h2>
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4 text-red-600">
              <div className="p-2 bg-red-100 rounded-lg">
                <DoorClosed className="h-5 w-5" />
              </div>
              <h3 className="font-medium">{t('mapPage.emergency.exits')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t('mapPage.emergency.exitsDescription')}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('mapPage.emergency.contact')}</p>
                <p className="text-sm text-muted-foreground">{t('mapPage.emergency.contactDescription')}</p>
              </div>
              <Button variant="outline" size="sm">{t('mapPage.emergency.viewMap')}</Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default HotelMap;
