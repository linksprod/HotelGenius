
import { supabase } from '@/integrations/supabase/client';
import { HotelAbout } from '@/lib/types';
import { transformAboutData, prepareDataForUpdate } from '@/utils/hotelAbout/transformUtils';

export const fetchAboutData = async (hotelId: string | null = null, isSuperAdmin: boolean = false) => {
  if (!hotelId && !isSuperAdmin) {
    return null;
  }

  let query = supabase
    .from('hotel_about')
    .select('*');

  if (hotelId) {
    query = query.eq('hotel_id', hotelId);
  }

  // If superAdmin and no specific hotelId, we still use maybeSingle?
  // Actually, about settings are per-hotel. 
  // If superAdmin is on a global page, they might see multiple.
  // But this service seems designed for a single hotel's about data.
  // For now, we'll allow it to return whatever fits (maybeSingle).
  const { data: aboutData, error } = await query.maybeSingle();

  if (error) {
    console.error('Error fetching hotel about data:', error);
    throw error;
  }

  if (!aboutData) {
    return null;
  }

  console.log('%c[fetchAboutData] DB row returned:', 'color:cyan;font-weight:bold', {
    id: aboutData.id,
    hotel_id: aboutData.hotel_id,
    features_raw: aboutData.features,
  });
  if (Array.isArray(aboutData.features)) {
    console.table(aboutData.features);
  }

  // ── Extra diagnostic: check for duplicate rows ──────────────────────────
  if (hotelId) {
    supabase
      .from('hotel_about')
      .select('id, hotel_id, welcome_title')
      .eq('hotel_id', hotelId)
      .then(({ data: allRows }) => {
        if (allRows && allRows.length > 1) {
          console.error('%c[fetchAboutData] ⚠️ DUPLICATE ROWS for hotel_id ' + hotelId, 'color:red;font-weight:bold', allRows);
        } else {
          console.log('%c[fetchAboutData] ✅ Unique row confirmed', 'color:lime', allRows);
        }
      });
  }

  return transformAboutData(aboutData);
};

export const updateAboutData = async (updatedData: Partial<HotelAbout>) => {
  const id = updatedData.id;

  if (!id) {
    throw new Error('No ID provided for update');
  }

  // Build the update payload explicitly — never omit features
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePayload: Record<string, any> = {};

  if (updatedData.welcome_title      !== undefined) updatePayload.welcome_title       = updatedData.welcome_title;
  if (updatedData.welcome_description !== undefined) updatePayload.welcome_description = updatedData.welcome_description;
  if (updatedData.welcome_description_extended !== undefined) updatePayload.welcome_description_extended = updatedData.welcome_description_extended;
  if (updatedData.directory_title    !== undefined) updatePayload.directory_title     = updatedData.directory_title;
  if (updatedData.mission            !== undefined) updatePayload.mission             = updatedData.mission;
  if (updatedData.hero_image         !== undefined) updatePayload.hero_image          = updatedData.hero_image;
  if (updatedData.hero_title         !== undefined) updatePayload.hero_title          = updatedData.hero_title;
  if (updatedData.hero_subtitle      !== undefined) updatePayload.hero_subtitle       = updatedData.hero_subtitle;

  // JSON columns — always include if present, even if empty array
  if (updatedData.features          !== undefined) updatePayload.features           = updatedData.features;
  if (updatedData.important_numbers !== undefined) updatePayload.important_numbers  = updatedData.important_numbers;
  if (updatedData.facilities        !== undefined) updatePayload.facilities         = updatedData.facilities;
  if (updatedData.hotel_policies    !== undefined) updatePayload.hotel_policies     = updatedData.hotel_policies;
  if (updatedData.additional_info   !== undefined) updatePayload.additional_info    = updatedData.additional_info;

  if (updatedData.has_seminars      !== undefined) updatePayload.has_seminars       = updatedData.has_seminars;
  if (updatedData.seminar_description !== undefined) updatePayload.seminar_description = updatedData.seminar_description;
  if (updatedData.seminar_image     !== undefined) updatePayload.seminar_image      = updatedData.seminar_image;
  if (updatedData.seminar_services  !== undefined) updatePayload.seminar_services   = updatedData.seminar_services;
  if (updatedData.seminar_rooms     !== undefined) updatePayload.seminar_rooms      = updatedData.seminar_rooms;

  if (updatedData.loyalty_enabled   !== undefined) updatePayload.loyalty_enabled    = updatedData.loyalty_enabled;
  if (updatedData.loyalty_title     !== undefined) updatePayload.loyalty_title      = updatedData.loyalty_title;
  if (updatedData.loyalty_description !== undefined) updatePayload.loyalty_description = updatedData.loyalty_description;
  if (updatedData.loyalty_tiers     !== undefined) updatePayload.loyalty_tiers      = updatedData.loyalty_tiers;
  if (updatedData.loyalty_benefits  !== undefined) updatePayload.loyalty_benefits   = updatedData.loyalty_benefits;

  console.log('%c[updateAboutData] payload → DB:', 'color:orange;font-weight:bold', {
    id,
    features: updatePayload.features,
    allKeys: Object.keys(updatePayload),
  });

  const { data: responseData, error } = await supabase
    .from('hotel_about')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating hotel about data in service:', error);
    throw error;
  }

  console.log('%c[updateAboutData] ✅ DB response features:', 'color:lime;font-weight:bold', responseData?.features);
  return responseData;
};

export const createInitialAbout = async (initialData: Partial<HotelAbout> & { hotelId?: string }) => {
  const { hotelId, ...restData } = initialData;

  const createPayload = {
    title: 'About Our Hotel',
    description: 'Learn more about our hotel, facilities, and services.',
    icon: 'Info',
    action_text: 'Explore',
    action_link: '/about',
    status: 'active',
    hotel_id: hotelId ?? null,
    ...prepareDataForUpdate(restData)
  };

  const { data, error } = await supabase
    .from('hotel_about')
    .insert(createPayload)
    .select()
    .single();

  if (error) {
    console.error('Error creating hotel about data:', error);
    throw error;
  }

  return data;
};
