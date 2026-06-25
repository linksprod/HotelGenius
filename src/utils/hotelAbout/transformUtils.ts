import { HotelAbout } from '@/lib/types';
import {
  defaultImportantNumbers,
  defaultFacilities,
  defaultPolicies,
  defaultAdditionalInfo,
  defaultFeatures
} from './defaultValues';
import { parseJsonArray } from './parseUtils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformAboutData = (aboutData: any): HotelAbout => {
  return {
    id: aboutData.id,
    welcome_title: aboutData.welcome_title || 'Welcome to Our Hotel',
    welcome_description: aboutData.welcome_description || 'Hotel Genius is a luxury hotel located in the heart of the city.',
    welcome_description_extended: aboutData.welcome_description_extended || 'Since our establishment, we have been committed to creating a home away from home for our guests.',
    directory_title: aboutData.directory_title || 'Hotel Directory & Information',
    important_numbers: parseJsonArray(aboutData.important_numbers, defaultImportantNumbers, 'info'),
    facilities: parseJsonArray(aboutData.facilities, defaultFacilities, 'info'),
    hotel_policies: parseJsonArray(aboutData.hotel_policies, defaultPolicies, 'info'),
    additional_info: parseJsonArray(aboutData.additional_info, defaultAdditionalInfo, 'info'),
    features: parseJsonArray(aboutData.features, defaultFeatures, 'feature'),
    mission: aboutData.mission || 'To provide exceptional hospitality experiences by creating memorable moments for our guests.',
    created_at: aboutData.created_at || new Date().toISOString(),
    updated_at: aboutData.updated_at || new Date().toISOString(),
    hero_image: aboutData.hero_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=80',
    hero_title: aboutData.hero_title || 'Welcome to Our Hotel',
    hero_subtitle: aboutData.hero_subtitle || 'Discover luxury and comfort',
    has_seminars: !!aboutData.has_seminars,
    seminar_description: aboutData.seminar_description || '',
    seminar_image: aboutData.seminar_image || '',
    seminar_services: (() => {
      try {
        if (!aboutData.seminar_services) return [];
        const raw = Array.isArray(aboutData.seminar_services)
          ? aboutData.seminar_services
          : (typeof aboutData.seminar_services === 'string' ? JSON.parse(aboutData.seminar_services) : []);
        // Normalize: if items are plain strings (old format), convert to {name, icon}
        return raw.map((item: unknown) => {
          if (typeof item === 'string') return { name: item, icon: 'CheckCircle2' };
          if (item && typeof item === 'object' && 'name' in item) return item;
          return { name: String(item), icon: 'CheckCircle2' };
        });
      } catch (e) {
        return [];
      }
    })(),
    seminar_rooms: (() => {
      try {
        if (!aboutData.seminar_rooms) return [];
        return Array.isArray(aboutData.seminar_rooms) 
          ? aboutData.seminar_rooms 
          : (typeof aboutData.seminar_rooms === 'string' ? JSON.parse(aboutData.seminar_rooms) : []);
      } catch (e) {
        return [];
      }
    })()
  };
};

export const prepareDataForUpdate = (data: Partial<HotelAbout>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};
  
  if (data.id) updateData.id = data.id;
  if (data.welcome_title) updateData.welcome_title = data.welcome_title;
  if (data.welcome_description) updateData.welcome_description = data.welcome_description;
  if (data.welcome_description_extended) updateData.welcome_description_extended = data.welcome_description_extended;
  if (data.directory_title) updateData.directory_title = data.directory_title;
  if (data.mission) updateData.mission = data.mission;
  if (data.hero_image) updateData.hero_image = data.hero_image;
  if (data.hero_title) updateData.hero_title = data.hero_title;
  if (data.hero_subtitle) updateData.hero_subtitle = data.hero_subtitle;
  
  if (data.important_numbers) updateData.important_numbers = data.important_numbers;
  if (data.facilities) updateData.facilities = data.facilities;
  if (data.hotel_policies) updateData.hotel_policies = data.hotel_policies;
  if (data.additional_info) updateData.additional_info = data.additional_info;
  if (data.features) updateData.features = data.features;

  if (data.has_seminars !== undefined) updateData.has_seminars = data.has_seminars;
  if (data.seminar_description !== undefined) updateData.seminar_description = data.seminar_description;
  if (data.seminar_image !== undefined) updateData.seminar_image = data.seminar_image;
  if (data.seminar_services !== undefined) updateData.seminar_services = data.seminar_services;
  if (data.seminar_rooms !== undefined) updateData.seminar_rooms = data.seminar_rooms;
  
  return updateData;
};
