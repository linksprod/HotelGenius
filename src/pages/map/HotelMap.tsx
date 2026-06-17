
import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DoorClosed } from 'lucide-react';
import { useHotel } from '@/features/hotels/context/HotelContext';

const HOTEL_MAP_URLS: Record<string, string> = {
  'hotel-palais-bayram': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.9428852768983!2d10.168363375302805!3d36.79591976794172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd340a8d8d3e11%3A0x5b1adb83eaf0389c!2sBayram%20Palace%20-%20Palais%20Bayram!5e0!3m2!1sfr!2stn!4v1781701612322!5m2!1sfr!2stn',
  'palais-bayram': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.9428852768983!2d10.168363375302805!3d36.79591976794172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd340a8d8d3e11%3A0x5b1adb83eaf0389c!2sBayram%20Palace%20-%20Palais%20Bayram!5e0!3m2!1sfr!2stn!4v1781701612322!5m2!1sfr!2stn',
  'laico-hammamet': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3224.2384210631626!2d10.5348873!3d36.3671158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13029f6de31e21b7%3A0x9eb19a6bbf08dc78!2sLaico%20Hammamet!5e0!3m2!1sfr!2stn!4v1781701612322!5m2!1sfr!2stn'
};

const HotelMap = () => {
  const { t } = useTranslation();
  const { hotel } = useHotel();

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
