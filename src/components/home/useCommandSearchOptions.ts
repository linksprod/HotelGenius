
import { useSpaServices } from '@/hooks/useSpaServices';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useShops } from '@/hooks/useShops';
import { useRequestCategories } from '@/hooks/useRequestCategories';
import { Leaf, UtensilsCrossed, Store, Wrench } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Define the SearchOption interface at the top
interface SearchOption {
  label: string;
  route: string;
  keywords: string;
  type: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  image?: string;
  category?: string;
}

const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const useCommandSearchOptions = () => {
  const { t } = useTranslation();
  const { services: spaServices = [] } = useSpaServices();
  const { restaurants = [] } = useRestaurants();
  const { shops = [] } = useShops();
  const { categories = [], allItems = [], isLoading, isError, error } = useRequestCategories();
  console.log("Search categories:", categories.length, "items:", allItems.length, "isLoading:", isLoading, "isError:", isError, "error:", error);

  const spaServiceOptions: SearchOption[] = spaServices.map((service) => ({
    label: service.name,
    route: `/spa?service=${service.id}`,
    keywords: `${service.name} ${service.description ?? ''} spa wellness soins`,
    type: 'spa-service',
    icon: Leaf,
    image: service.image,
    category: "Spa"
  }));

  const restaurantOptions: SearchOption[] = restaurants.map((rest) => ({
    label: rest.name,
    route: `/dining/${rest.id}`,
    keywords: `${rest.name} ${rest.cuisine ?? ''} restaurant gastronomy food ${rest.description ?? ''}`,
    type: 'restaurant',
    icon: UtensilsCrossed,
    image: rest.images?.[0],
    category: "Restaurants",
  }));

  const shopOptions: SearchOption[] = shops.map((shop) => ({
    label: shop.name,
    route: `/shops?shop=${shop.id}`,
    keywords: `${shop.name} ${shop.description ?? ''} shop boutique shopping magasin`,
    type: 'shop',
    icon: Store,
    image: shop.image,
    category: shop.is_hotel_shop ? "Hotel Shops" : "Nearby Shops"
  }));

  const serviceCategoryOptions: SearchOption[] = categories.map((cat) => ({
    label: cat.name,
    route: `/services?search=${encodeURIComponent(cat.name)}`,
    keywords: `${cat.name} housekeeping housekeeping maintenance IT support technology concierge support request service`,
    type: 'service-category',
    icon: Wrench,
    category: "Services",
  }));

  const serviceItemOptions: SearchOption[] = allItems.map((item) => {
    const category = categories.find(c => c.id === item.category_id);
    return {
      label: item.name,
      route: `/services?search=${encodeURIComponent(item.name)}`,
      keywords: `${item.name} ${item.description ?? ''} ${category?.name ?? ''} housekeeping maintenance IT support technology concierge support request service`,
      type: 'service-item',
      icon: Wrench,
      category: category?.name ?? "Services",
    };
  });

  const searchablePages: SearchOption[] = [
    { label: t('search.pages.aboutUs', 'About Us'), route: "/about", keywords: t('search.pages.aboutUsKeywords', 'information hotel story'), type: 'page' },
    { label: t('search.pages.gastronomy', 'Gastronomy'), route: "/dining", keywords: t('search.pages.gastronomyKeywords', 'dining restaurant food'), type: 'page' },
    { label: t('search.pages.concierge', 'Concierge'), route: "/services", keywords: t('search.pages.conciergeKeywords', 'concierge service support'), type: 'page' },
    { label: t('search.pages.spaWellness', 'Spa & Wellness'), route: "/spa", keywords: t('search.pages.spaWellnessKeywords', 'spa wellness relax'), type: 'page' },
    { label: t('search.pages.shops', 'Shops'), route: "/shops", keywords: t('search.pages.shopsKeywords', 'shopping shop luxury'), type: 'page' },
    { label: t('search.pages.hotelMap', 'Hotel Map'), route: "/map", keywords: t('search.pages.hotelMapKeywords', 'map navigation directions'), type: 'page' },
    { label: t('search.pages.destination', 'Destination'), route: "/destination", keywords: t('search.pages.destinationKeywords', 'nearby activities'), type: 'page' },
    { label: t('search.pages.events', 'Events'), route: "/events", keywords: t('search.pages.eventsKeywords', 'event'), type: 'page' },
    { label: t('search.pages.activities', 'Activities'), route: "/activities", keywords: t('search.pages.activitiesKeywords', 'activity leisure fun'), type: 'page' },
    { label: t('search.pages.myRoom', 'My Room'), route: "/my-room", keywords: t('search.pages.myRoomKeywords', 'room command requests'), type: 'page' },
    { label: t('search.pages.contact', 'Contact'), route: "/contact", keywords: t('search.pages.contactKeywords', 'contact help assistance'), type: 'page' },
    { label: t('search.pages.feedback', 'Feedback'), route: "/feedback", keywords: t('search.pages.feedbackKeywords', 'review feedback'), type: 'page' },
  ];

  const allSearchOptions = [
    ...searchablePages,
    ...spaServiceOptions,
    ...restaurantOptions,
    ...shopOptions,
    ...serviceCategoryOptions,
    ...serviceItemOptions,
  ];

  const getFilteredResults = (query: string) => {
    if (!query) return allSearchOptions;
    const normQ = normalize(query);
    return allSearchOptions.filter(
      ({ label, keywords }) =>
        normalize(label).includes(normQ) ||
        normalize(keywords ?? '').includes(normQ)
    );
  };

  return { allSearchOptions, getFilteredResults };
};
