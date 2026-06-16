
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink } from 'lucide-react';
import Layout from '@/components/Layout';
import { useShops } from '@/hooks/useShops';

const Shops = () => {
  const { t } = useTranslation();
  const { shops } = useShops();
  
  // Separate shops into two categories
  const hotelShops = shops.filter(shop => shop.is_hotel_shop);
  const nearbyShops = shops.filter(shop => !shop.is_hotel_shop);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hotel Shops Section — only shown if there are hotel shops */}
        {hotelShops.length > 0 && (
          <>
            <div className="relative mb-8 rounded-3xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1581539250439-c96689b516dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Hotel Shops" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{t('shopsPage.hotelShops.title')}</h1>
                <p className="text-xl mb-6">{t('shopsPage.hotelShops.subtitle')}</p>
              </div>
            </div>

            <div className="space-y-4 mb-16">
              {hotelShops.map((shop) => (
                <Card key={shop.id} className="p-3 md:p-4 rounded-xl">
                  <div className="flex items-stretch gap-3">
                    <div className="relative w-[150px] min-w-[150px] md:w-[160px] md:min-w-[160px] rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={shop.image || "https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f"}
                        alt={shop.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm md:text-base mb-1">{t(`shops.name.${shop.id}`, shop.name)}</h3>
                      <div className="flex items-center text-xs md:text-sm text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{t(`shops.location.${shop.id}`, shop.location || t('shopsPage.hotelShops.insideHotel'))}</span>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2 flex-grow line-clamp-2 md:line-clamp-none">{t(`shops.description.${shop.id}`, shop.description)}</p>
                      <div className="flex gap-2 mt-auto">
                        {shop.hours && (
                          <div className="text-xs text-muted-foreground">
                            {t('shopsPage.hotelShops.hours')}: {shop.hours}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Shopping Centers Section */}
        {nearbyShops.length > 0 && (
          <>
            <div className="relative mb-8 rounded-3xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Shopping" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{t('shopsPage.shoppingCenters.title')}</h1>
                <p className="text-xl mb-6">{t('shopsPage.shoppingCenters.subtitle')}</p>
              </div>
            </div>

            <div className="space-y-4">
              {nearbyShops.map((shop) => (
                <Card key={shop.id} className="p-3 md:p-4 rounded-xl">
                  <div className="flex items-stretch gap-3">
                    <div className="relative w-[150px] min-w-[150px] md:w-[160px] md:min-w-[160px] rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={shop.image || "https://images.unsplash.com/photo-1568254183919-78a4f43a2877"}
                        alt={shop.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm md:text-base mb-1">{t(`shops.name.${shop.id}`, shop.name)}</h3>
                      <div className="flex items-center text-xs md:text-sm text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{t(`shops.location.${shop.id}`, shop.location)}</span>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2 flex-grow line-clamp-2 md:line-clamp-none">{t(`shops.description.${shop.id}`, shop.description)}</p>
                      <div className="flex gap-2 mt-auto">
                        {shop.location && (
                          <Button size="sm" variant="outline" className="text-xs" asChild>
                            <a href={`https://maps.google.com/?q=${encodeURIComponent(shop.location)}`} target="_blank" rel="noopener noreferrer">
                              {t('shopsPage.shoppingCenters.directions')}
                            </a>
                          </Button>
                        )}
                        {shop.contact_email && (
                          <Button size="sm" className="text-xs" asChild>
                            <a href={`mailto:${shop.contact_email}`}>
                              {t('shopsPage.shoppingCenters.contact')}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Shops;
