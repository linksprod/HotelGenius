import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export interface AdminDashboardStats {
  totalReservations: number;
  tableReservations: number;
  spaBookings: number;
  eventReservations: number;
  messagesCount: number;
  currentGuests: number;
  activeEvents: number;
  serviceRequests: {
    total: number;
    pending: number;
    completed: number;
  };
  guestSatisfaction: number;
  feedbackCount: number;
  conversationsCount: number;
  todayActivity: {
    newReservations: number;
    newMessages: number;
    unansweredMessages: number;
  };
}

const fetchDashboardStats = async (hotelId: string | null): Promise<AdminDashboardStats> => {
  const today = new Date().toISOString().split('T')[0];

  // Helper to add hotel_id filter if present
  const query = (table: string) => {
    let q = supabase.from(table as any).select('*', { count: 'exact', head: true });
    if (hotelId) q = q.eq('hotel_id', hotelId);
    return q;
  };

  let userIds: string[] = [];
  if (hotelId) {
    const { data: guests } = await supabase
      .from('guests')
      .select('user_id')
      .eq('hotel_id', hotelId);
    userIds = guests?.map(g => g.user_id).filter(Boolean) as string[] || [];
  }

  // Specific query builders for different needs
  const guestsQuery = () => {
    let q = supabase.from('guests' as any).select('*', { count: 'exact', head: true }).gte('check_out_date', today);
    if (hotelId) q = q.eq('hotel_id', hotelId);
    return q;
  };

  const eventsQuery = () => {
    let q = supabase.from('events' as any).select('*', { count: 'exact', head: true }).gte('date', today);
    if (hotelId) q = q.eq('hotel_id', hotelId);
    return q;
  };

  const serviceRequestsQuery = () => {
    let q = supabase.from('service_requests' as any).select('status');
    if (hotelId) q = q.eq('hotel_id', hotelId);
    return q;
  };

  const feedbackQuery = () => {
    let q = supabase.from('guest_feedback' as any).select('rating');
    if (hotelId) q = q.eq('hotel_id', hotelId);
    return q;
  };

  const todayReservationsQuery = () => {
    let q = supabase.from('table_reservations').select('*', { count: 'exact', head: true }).eq('date', today);
    if (hotelId) q = q.eq('hotel_id', hotelId);
    return q;
  };

  const todayMessagesQuery = () => {
    let q = supabase.from('messages' as any).select('*', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`);
    if (hotelId) q = q.eq('hotel_id', hotelId);
    return q;
  };

  const unansweredMessagesQuery = () => {
    let q = supabase.from('conversations' as any).select('*', { count: 'exact', head: true }).eq('status', 'active').eq('current_handler', 'ai');
    if (hotelId) q = q.eq('hotel_id', hotelId);
    return q;
  };

  // Fetch all data in parallel
  const [
    tableReservationsResult,
    spaBookingsResult,
    eventReservationsResult,
    messagesResult,
    guestsResult,
    eventsResult,
    serviceRequestsResult,
    feedbackResult,
    conversationsResult,
    todayReservationsResult,
    todayMessagesResult,
    unansweredMessagesResult
  ] = await Promise.all([
    query('table_reservations'),
    query('spa_bookings'),
    query('event_reservations'),
    query('messages'),
    guestsQuery(),
    eventsQuery(),
    serviceRequestsQuery(),
    feedbackQuery(),
    query('conversations'),
    todayReservationsQuery(),
    todayMessagesQuery(),
    unansweredMessagesQuery()
  ]);

  // Calculate service request stats
  const serviceRequests = (serviceRequestsResult.data as any) || [];
  const pendingCount = serviceRequests.filter((r: any) => r.status === 'pending').length;
  const completedCount = serviceRequests.filter((r: any) => r.status === 'completed').length;

  // Calculate average rating
  const ratings = (feedbackResult.data as any) || [];
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / ratings.length
    : 0;

  return {
    totalReservations: (tableReservationsResult.count || 0) + (spaBookingsResult.count || 0) + (eventReservationsResult.count || 0),
    tableReservations: tableReservationsResult.count || 0,
    spaBookings: spaBookingsResult.count || 0,
    eventReservations: eventReservationsResult.count || 0,
    messagesCount: messagesResult.count || 0,
    currentGuests: guestsResult.count || 0,
    activeEvents: eventsResult.count || 0,
    serviceRequests: {
      total: serviceRequests.length,
      pending: pendingCount,
      completed: completedCount
    },
    guestSatisfaction: Math.round(avgRating * 10) / 10,
    feedbackCount: ratings.length,
    conversationsCount: conversationsResult.count || 0,
    todayActivity: {
      newReservations: todayReservationsResult.count || 0,
      newMessages: todayMessagesResult.count || 0,
      unansweredMessages: unansweredMessagesResult.count || 0
    }
  };
};

export const useAdminDashboardStats = () => {
  const { hotelId, isSuperAdmin } = useCurrentHotelId();
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo/');

  return useQuery({
    queryKey: ['admin-dashboard-stats', hotelId, isSuperAdmin],
    queryFn: async () => {
      const stats = await fetchDashboardStats(hotelId);
      
      if (isDemo) {
        return {
          ...stats,
          totalReservations: 48,
          currentGuests: 124,
          serviceRequests: {
            total: 20,
            pending: 0,
            completed: 20
          },
          guestSatisfaction: 9.2, // We'll handle the /10 in the UI
          feedbackCount: 45,
          conversationsCount: 15,
          todayActivity: {
            newReservations: 48,
            newMessages: 12,
            unansweredMessages: 0
          }
        };
      }
      
      return stats;
    },
    refetchInterval: 30000,
    staleTime: 10000,
    enabled: true,
  });
};
