import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { 
  Bell, 
  Brain, 
  Utensils, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Activity,
  Wrench,
  Trash2,
  AlertCircle,
  Building2
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  category: string;
  title: string;
  description: string;
  time: string;
  type: 'ai' | 'f&b' | 'guest' | 'ops' | 'service';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
  bgColor: string;
  timestamp: string;
}

export const useNotificationFeed = () => {
  const { hotelId } = useCurrentHotelId();
  const isGlobal = typeof window !== 'undefined' && window.location.pathname.startsWith('/administration/super');
  const client = isGlobal ? supabaseAdmin : supabase;

  return useQuery({
    queryKey: ['notification-feed', hotelId, isGlobal],
    queryFn: async (): Promise<NotificationItem[]> => {
      const feed: NotificationItem[] = [];

      if (isGlobal) {
        // --- GLOBAL ADMIN FEED: Focus on Platform Events ---
        
        // 1. Fetch New Hotel Signups
        const { data: hotelsData } = await client
          .from('hotels')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        // 2. Fetch New Platform Users
        const { data: usersData } = await client
          .from('profiles')
          .select('id, full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        // 3. AI Platform Status (Simulated/Static for now)
        feed.push({
          id: 'ai-core-1',
          category: 'Neural Core',
          title: 'Model Hg-Intelligence-V4 Active',
          description: 'Global weights optimized across all 3 production clusters.',
          time: 'Active',
          type: 'ai',
          icon: Brain,
          color: 'text-rose-500',
          bgColor: 'bg-rose-500/10',
          timestamp: new Date().toISOString()
        });

        if (hotelsData) {
          feed.push(...hotelsData.map(h => ({
            id: h.id,
            category: 'Platform Growth',
            title: 'New Hotel Registered',
            description: `${h.name} has successfully joined the HotelGenius network.`,
            time: new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'ops' as const,
            icon: Building2,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            timestamp: h.created_at
          })));
        }

        if (usersData) {
          feed.push(...usersData.filter(u => u.full_name).map(u => ({
            id: u.id,
            category: 'Network Access',
            title: 'New Staff Access',
            description: `${u.full_name} granted platform credentials.`,
            time: new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'guest' as const,
            icon: ShieldCheck,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
            timestamp: u.created_at
          })));
        }

      } else {
        // --- HOTEL ADMIN FEED: Focus on Guest Operations ---
        
        // 1. Fetch Service Requests (Ops/Service)
        let serviceQuery = client
          .from('service_requests')
          .select(`
            id, 
            created_at, 
            status, 
            category_id,
            request_categories(name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (hotelId) serviceQuery = serviceQuery.eq('hotel_id', hotelId);
        const { data: serviceData } = await serviceQuery;

        // 2. Fetch Table Reservations (F&B)
        let restaurantQuery = client
          .from('table_reservations')
          .select(`
            id, 
            created_at, 
            status, 
            guest_name,
            restaurants(name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (hotelId) restaurantQuery = restaurantQuery.eq('hotel_id', hotelId);
        const { data: restaurantData } = await restaurantQuery;

        // 3. Fetch New Guests (Guest Experience)
        let guestsQuery = client
          .from('guests')
          .select('id, created_at, first_name, last_name, hotel_id')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (hotelId) guestsQuery = guestsQuery.eq('hotel_id', hotelId);
        const { data: guestsData } = await guestsQuery;

        if (serviceData) {
          feed.push(...serviceData.map(s => ({
            id: s.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            category: (s as any).request_categories?.name || 'Service',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            title: `New ${ (s as any).request_categories?.name || 'Service' } Request`,
            description: `A new ${s.status} request has been logged.`,
            time: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'ops' as const,
            icon: ShieldCheck,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
            timestamp: s.created_at
          })));
        }

        if (restaurantData) {
          feed.push(...restaurantData.map(r => ({
            id: r.id,
            category: 'F&B Insight',
            title: 'New Reservation',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            description: `${r.guest_name} reserved a table at ${(r as any).restaurants?.name || 'the restaurant'}.`,
            time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'f&b' as const,
            icon: Utensils,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
            timestamp: r.created_at
          })));
        }

        if (guestsData) {
          feed.push(...guestsData.map(g => ({
            id: g.id,
            category: 'Guest Experience',
            title: 'Guest Registered',
            description: `${g.first_name} ${g.last_name} has just joined the platform.`,
            time: new Date(g.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'guest' as const,
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            timestamp: g.created_at
          })));
        }
      }

      return feed
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);
    },
    refetchInterval: 30000,
  });
};
