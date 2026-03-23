import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';

export interface SuperDashboardStats {
  totalHotels: number;
  totalReservations: number;
  totalGuests: number;
  totalUsers: number;
  activeStaff: number;
  messagesCount: number;
  serviceRequests: {
    total: number;
    pending: number;
    completed: number;
  };
  todayActivity: {
    newHotels: number;
    newGuests: number;
    totalMessages: number;
  };
  growthData: Array<{
    day: string;
    visitors: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'registration' | 'message';
    hotelName: string;
    hotelSlug: string;
    description: string;
    timestamp: string;
  }>;
  hotelsDetails?: Array<{
    id: string;
    name: string;
    slug: string;
    guestCount: number;
    messageCount: number;
  }>;
}

const fetchSuperStats = async (): Promise<SuperDashboardStats> => {
  const today = new Date().toISOString().split('T')[0];

  // We use supabaseAdmin for these queries to bypass RLS and see EVERYTHING
  try {
    const [
      hotelsResult,
      reservationsResult,
      guestsResult,
      usersResult,
      messagesResult,
      serviceResult,
      todayHotelsResult,
      todayGuestsResult,
      allHotelsResult,
      recentAuthGuests,
      recentMessages
    ] = await Promise.all([
      supabaseAdmin.from('hotels').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('table_reservations').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('guests').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('user_roles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('messages').select('*', { count: 'exact', head: true }),
      (async () => {
        try {
          return await supabaseAdmin.from('service_requests').select('status');
        } catch (e) {
          return { data: [], error: e };
        }
      })(),
      supabaseAdmin.from('hotels').select('*', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`),
      supabaseAdmin.from('guests').select('*', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`),
      supabaseAdmin.from('hotels').select('id, name, slug'),
      supabaseAdmin.from('guests').select('id, hotel_id, created_at, first_name, last_name').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('messages').select('id, hotel_id, created_at, content').order('created_at', { ascending: false }).limit(5)
    ]);

    const serviceRequests = serviceResult?.data || [];
    const pendingCount = serviceRequests.filter((r: any) => r.status === 'pending').length;
    const completedCount = serviceRequests.filter((r: any) => r.status === 'completed').length;

    // Combine and sort recent activity
    const hotels = allHotelsResult.data || [];
    const recentActivity: any[] = [
      ...(recentAuthGuests.data || []).map((g: any) => ({
        id: g.id,
        type: 'registration',
        hotelName: hotels.find(h => h.id === g.hotel_id)?.name || 'Unknown Hotel',
        hotelSlug: hotels.find(h => h.id === g.hotel_id)?.slug || '',
        description: `New registration: ${g.first_name || 'Guest'} ${g.last_name || ''}`,
        timestamp: g.created_at
      })),
      ...(recentMessages.data || []).map((m: any) => ({
        id: m.id,
        type: 'message',
        hotelName: hotels.find(h => h.id === m.hotel_id)?.name || 'Unknown Hotel',
        hotelSlug: hotels.find(h => h.id === m.hotel_id)?.slug || '',
        description: `New message: ${m.content?.substring(0, 30)}...`,
        timestamp: m.created_at
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);



    // Calculate growth data for the last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const growthData = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];

        const { count } = await supabaseAdmin
          .from('guests')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${nextDayStr}T00:00:00`);

        return {
          day: days[d.getDay()],
          visitors: count || 0
        };
      })
    );

    return {
      totalHotels: hotelsResult.count || 0,
      totalReservations: reservationsResult.count || 0,
      totalGuests: guestsResult.count || 0,
      totalUsers: usersResult.count || 0,
      activeStaff: usersResult.count || 0,
      messagesCount: messagesResult.count || 0,
      serviceRequests: {
        total: serviceRequests.length,
        pending: pendingCount,
        completed: completedCount
      },
      todayActivity: {
        newHotels: todayHotelsResult.count || 0,
        newGuests: todayGuestsResult.count || 0,
        totalMessages: 0
      },
      growthData,
      recentActivity,
      hotelsDetails: await Promise.all(hotels.map(async (h: any) => {
        try {
          const [gCount, mCount] = await Promise.all([
            supabaseAdmin.from('guests').select('*', { count: 'exact', head: true }).eq('hotel_id', h.id),
            supabaseAdmin.from('messages').select('*', { count: 'exact', head: true }).eq('hotel_id', h.id)
          ]);
          return {
            ...h,
            guestCount: gCount.count || 0,
            messageCount: mCount.count || 0
          };
        } catch (e) {
          return { ...h, guestCount: 0, messageCount: 0 };
        }
      }))
    };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    // Return empty stats instead of crashing
    return {
      totalHotels: 0,
      totalReservations: 0,
      totalGuests: 0,
      totalUsers: 0,
      activeStaff: 0,
      messagesCount: 0,
      serviceRequests: { total: 0, pending: 0, completed: 0 },
      todayActivity: { newHotels: 0, newGuests: 0, totalMessages: 0 },
      growthData: [],
      recentActivity: [],
      hotelsDetails: []
    };
  }
};

export const useSuperDashboardStats = () => {
  return useQuery({
    queryKey: ['super-dashboard-stats'],
    queryFn: fetchSuperStats,
    refetchInterval: 60000,
    staleTime: 30000,
  });
};
