import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

const SECTION_KEYS = [
  'restaurants',
  'spa',
  'events',
  'housekeeping',
  'maintenance',
  'security',
  'information-technology',
  'chat',
] as const;

type SectionKey = (typeof SECTION_KEYS)[number];

// Category IDs from request_categories table
const CATEGORY_MAP: Record<string, SectionKey> = {
  '7beb3ccf-bbcf-4405-a397-6b6c636c955b': 'housekeeping',
  '621e423a-413f-4e8f-b471-bbd64e9c8c44': 'maintenance',
  '44b20203-fcc1-4cfc-88d9-30ef32b2f326': 'security',
  '2f96741e-3e04-4117-8d37-e94795e37a68': 'information-technology',
};

async function fetchCounts(hotelId: string | null): Promise<{ counts: Record<SectionKey, number>; restaurantCounts: Record<string, number>; spaServiceCounts: Record<string, number> }> {
  const counts: Record<string, number> = {};
  SECTION_KEYS.forEach((k) => (counts[k] = 0));

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { counts: counts as Record<SectionKey, number>, restaurantCounts: {}, spaServiceCounts: {} };

  // Fetch last seen timestamps
  const { data: seenRows } = await supabase
    .from('admin_section_seen')
    .select('section_key, last_seen_at')
    .eq('user_id', user.id);

  // Seed on first login: if no rows exist, insert current timestamp for all sections
  if (!seenRows || seenRows.length === 0) {
    const now = new Date().toISOString();
    const seedRows = SECTION_KEYS.map(key => ({
      user_id: user.id,
      section_key: key,
      last_seen_at: now,
    }));
    await supabase.from('admin_section_seen').upsert(seedRows, {
      onConflict: 'user_id,section_key',
    });
    return { counts: counts as Record<SectionKey, number>, restaurantCounts: {}, spaServiceCounts: {} };
  }

  const lastSeenMap: Record<string, string> = {};
  for (const row of seenRows) {
    lastSeenMap[row.section_key] = row.last_seen_at;
  }

  // Helper: get last_seen or epoch for first-time
  const getLastSeen = (key: string) => lastSeenMap[key] || '1970-01-01T00:00:00Z';

  // Restaurant reservations - global count for sidebar
  let restaurantQuery = supabase
    .from('table_reservations')
    .select('id, restaurants!inner(hotel_id)', { count: 'exact', head: true })
    .eq('status', 'pending')
    .gt('created_at', getLastSeen('restaurants'));

  if (hotelId) {
    restaurantQuery = restaurantQuery.eq('restaurants.hotel_id', hotelId);
  }
  const { count: restaurantCount } = await restaurantQuery;
  counts.restaurants = restaurantCount || 0;

  // Per-restaurant pending counts (only new ones)
  let restaurantDetailsQuery = supabase
    .from('table_reservations')
    .select('restaurant_id, restaurants!inner(hotel_id)')
    .eq('status', 'pending')
    .gt('created_at', getLastSeen('restaurants'));

  if (hotelId) {
    restaurantDetailsQuery = restaurantDetailsQuery.eq('restaurants.hotel_id', hotelId);
  }
  const { data: restaurantReservations } = await restaurantDetailsQuery;

  const restaurantCounts: Record<string, number> = {};
  if (restaurantReservations) {
    for (const r of restaurantReservations) {
      if (r.restaurant_id) {
        restaurantCounts[r.restaurant_id] = (restaurantCounts[r.restaurant_id] || 0) + 1;
      }
    }
  }

  // Spa bookings - global count for sidebar
  let spaQuery = supabase
    .from('spa_bookings')
    .select('id, spa_services!inner(hotel_id)', { count: 'exact', head: true })
    .eq('status', 'pending')
    .gt('created_at', getLastSeen('spa'));

  if (hotelId) {
    spaQuery = spaQuery.eq('spa_services.hotel_id', hotelId);
  }
  const { count: spaCount } = await spaQuery;
  counts.spa = spaCount || 0;

  // Spa bookings - per-service counts
  let spaDetailsQuery = supabase
    .from('spa_bookings')
    .select('service_id, created_at, spa_services!inner(hotel_id)')
    .eq('status', 'pending');

  if (hotelId) {
    spaDetailsQuery = spaDetailsQuery.eq('spa_services.hotel_id', hotelId);
  }
  const { data: spaBookings } = await spaDetailsQuery;

  const spaServiceCounts: Record<string, number> = {};
  if (spaBookings) {
    for (const b of spaBookings) {
      if (b.service_id) {
        const lastSeen = getLastSeen(`spa:${b.service_id}`);
        if (b.created_at && b.created_at > lastSeen) {
          spaServiceCounts[b.service_id] = (spaServiceCounts[b.service_id] || 0) + 1;
        }
      }
    }
  }

  // Event reservations
  let eventsQuery = supabase
    .from('event_reservations')
    .select('id, events!inner(hotel_id)', { count: 'exact', head: true })
    .eq('status', 'pending')
    .gt('created_at', getLastSeen('events'));

  if (hotelId) {
    eventsQuery = eventsQuery.eq('events.hotel_id', hotelId);
  }
  const { count: eventsCount } = await eventsQuery;
  counts.events = eventsCount || 0;

  // Chat: count conversations with new guest messages since last seen
  const chatLastSeen = getLastSeen('chat');
  let chatQuery = supabase
    .from('messages')
    .select('conversation_id, conversations!inner(hotel_id)')
    .eq('sender_type', 'guest')
    .gt('created_at', chatLastSeen);

  if (hotelId) {
    chatQuery = chatQuery.eq('conversations.hotel_id', hotelId);
  }

  const { data: newGuestMessages } = await chatQuery;

  if (newGuestMessages) {
    const uniqueConvos = new Set(newGuestMessages.map(m => m.conversation_id));
    counts.chat = uniqueConvos.size;
  }

  // Service requests by category
  let serviceRequestsQuery = supabase
    .from('service_requests')
    .select('category_id, created_at, request_items!inner(hotel_id)')
    .eq('status', 'pending');

  if (hotelId) {
    serviceRequestsQuery = serviceRequestsQuery.eq('request_items.hotel_id', hotelId);
  }
  const { data: serviceRequests } = await serviceRequestsQuery;

  if (serviceRequests) {
    for (const req of serviceRequests) {
      const section = CATEGORY_MAP[req.category_id || ''];
      if (section) {
        const lastSeen = getLastSeen(section);
        if (req.created_at && req.created_at > lastSeen) {
          counts[section] = (counts[section] || 0) + 1;
        }
      }
    }
  }

  return { counts: counts as Record<SectionKey, number>, restaurantCounts, spaServiceCounts };
}

export function useAdminNotifications() {
  const queryClient = useQueryClient();
  const { hotelId } = useCurrentHotelId();

  const [localCounts, setLocalCounts] = useState<Record<SectionKey, number>>(() => {
    const init: Record<string, number> = {};
    SECTION_KEYS.forEach((k) => (init[k] = 0));
    return init as Record<SectionKey, number>;
  });
  const [localRestaurantCounts, setLocalRestaurantCounts] = useState<Record<string, number>>({});
  const [localSpaServiceCounts, setLocalSpaServiceCounts] = useState<Record<string, number>>({});

  const { data } = useQuery({
    queryKey: ['admin-notifications', hotelId],
    queryFn: () => fetchCounts(hotelId),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (data) {
      setLocalCounts(data.counts);
      setLocalRestaurantCounts(data.restaurantCounts);
      setLocalSpaServiceCounts(data.spaServiceCounts);
    }
  }, [data]);

  // Realtime subscriptions
  useEffect(() => {
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-notifications', hotelId] });

    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'table_reservations' }, invalidate)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'table_reservations' }, invalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'spa_bookings' }, invalidate)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'spa_bookings' }, invalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'event_reservations' }, invalidate)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'event_reservations' }, invalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'service_requests' }, invalidate)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'service_requests' }, invalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, invalidate)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, hotelId]);

  const markSectionSeen = useCallback(async (sectionKey: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('admin_section_seen')
      .upsert(
        { user_id: user.id, section_key: sectionKey, last_seen_at: new Date().toISOString() },
        { onConflict: 'user_id,section_key' }
      );

    // Immediately refresh counts
    queryClient.invalidateQueries({ queryKey: ['admin-notifications', hotelId] });
  }, [queryClient, hotelId]);

  return { counts: localCounts, restaurantCounts: localRestaurantCounts, spaServiceCounts: localSpaServiceCounts, markSectionSeen };
}

export type { SectionKey };
