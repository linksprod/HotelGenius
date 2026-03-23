import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isBefore, isAfter, startOfDay, addDays, differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Home,
  ArrowRight,
  Calendar,
  ArrowLeftRight,
  Clock,
  Eye,
  Search,
  RefreshCw,
  ArrowUpDown,
  Star,
  UserCheck,
  UserMinus,
  Plus,
  Compass,
  Zap,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Guest } from './components/guests/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

type FilterType = 'all' | 'in-house' | 'arrivals-today' | 'arrivals-3d' | 'pre-arrival' | 'departures-today' | 'past';

interface FilterCard {
  id: FilterType;
  label: string;
  countKey: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  cardBgClass: string;
}

const filterCards: FilterCard[] = [
  { id: 'in-house', label: 'In-House', countKey: 'in-house', icon: Home, colorClass: 'text-primary', bgClass: 'bg-primary/10', cardBgClass: 'border-primary/10' },
  { id: 'arrivals-today', label: 'Arrivals Today', countKey: 'arrivals-today', icon: UserCheck, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', cardBgClass: 'border-emerald-500/10' },
  { id: 'arrivals-3d', label: '3-Day Arrivals', countKey: 'arrivals-3d', icon: Zap, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10', cardBgClass: 'border-amber-500/10' },
  { id: 'pre-arrival', label: 'Pre-arrival', countKey: 'pre-arrival', icon: Compass, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', cardBgClass: 'border-blue-500/10' },
  { id: 'departures-today', label: 'Leaving Today', countKey: 'departures-today', icon: UserMinus, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10', cardBgClass: 'border-rose-500/10' },
];

type SortOption = 'newest' | 'oldest' | 'check-in-asc' | 'check-in-desc' | 'check-out-asc' | 'check-out-desc';

import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};
import { useHotelPath } from '@/hooks/useHotelPath';
import DemoInstructionOverlay from '@/components/admin/DemoInstructionOverlay';

const GuestsManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [activeTab, setActiveTab] = useState('all'); // Added for the new UI
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();

  const handleViewGuest = (guest: Guest) => {
    navigate(resolvePath(`/admin/guests/${guest.id}`));
  };

  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo/');

  const { data: guests = [], isLoading, refetch } = useQuery({
    queryKey: ['guests', hotelId, isSuperAdmin],
    queryFn: async () => {
      if (isDemo) {
        // Return rich mock data for instant demo performance
        const demoGuests = [
            {
              id: 'demo-1',
              first_name: 'Sofia',
              last_name: 'Al-Fayed',
              email: 'sofia.fayed@emirates.com',
              phone: '+971 50 123 4567',
              room_number: '1202',
              check_in_date: new Date().toISOString(),
              check_out_date: new Date(Date.now() + 86400000 * 5).toISOString(),
              created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
              hotel_id: hotelId || 'demo-hotel',
              guest_type: 'VIP',
              is_vip: true,
              profile_image: '/demo/guests/sofia.png'
            },
            {
              id: 'demo-2',
              first_name: 'James',
              last_name: 'Wilson',
              email: 'j.wilson@techcorp.uk',
              phone: '+44 7700 900123',
              room_number: '405',
              check_in_date: new Date(Date.now() - 86400000 * 2).toISOString(),
              check_out_date: new Date(Date.now() + 86400000).toISOString(),
              created_at: new Date(Date.now() - 86400000 * 40).toISOString(),
              hotel_id: hotelId || 'demo-hotel',
              guest_type: 'Business',
              is_vip: false,
              profile_image: '/demo/guests/james.png'
            },
            {
              id: 'demo-3',
              first_name: 'Elena',
              last_name: 'Rodríguez',
              email: 'elena.rod@madrid.es',
              phone: '+34 600 123 456',
              room_number: '812',
              check_in_date: new Date().toISOString(),
              check_out_date: new Date(Date.now() + 86400000 * 7).toISOString(),
              created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
              hotel_id: hotelId || 'demo-hotel',
              guest_type: 'Leisure',
              is_vip: true,
              profile_image: '/demo/guests/elena.png'
            },
            {
              id: 'demo-4',
              first_name: 'Marcus',
              last_name: 'Chen',
              email: 'marcus.chen@singaporeair.sg',
              phone: '+65 9123 4567',
              room_number: 'PH1',
              check_in_date: new Date(Date.now() + 86400000).toISOString(),
              check_out_date: new Date(Date.now() + 86400000 * 14).toISOString(),
              created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
              hotel_id: hotelId || 'demo-hotel',
              guest_type: 'VIP',
              is_vip: true,
              profile_image: '/demo/guests/marcus.png'
            },
            {
              id: 'demo-5',
              first_name: 'Sarah',
              last_name: 'Jenkins',
              email: 'sarah.j@outlook.com',
              phone: '+1 212 555 0198',
              room_number: '302',
              check_in_date: new Date(Date.now() - 86400000 * 10).toISOString(),
              check_out_date: new Date(Date.now() - 86400000 * 1).toISOString(),
              created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
              hotel_id: hotelId || 'demo-hotel',
              guest_type: 'Past',
              is_vip: false,
              profile_image: '/demo/guests/sarah.png'
            },
            {
              id: 'demo-6',
              first_name: 'Yuki',
              last_name: 'Tanaka',
              email: 'yuki.t@tokyo.jp',
              phone: '+81 90 1234 5678',
              room_number: '1505',
              check_in_date: new Date().toISOString(),
              check_out_date: new Date(Date.now() + 86400000 * 3).toISOString(),
              created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
              hotel_id: hotelId || 'demo-hotel',
              guest_type: 'New',
              is_vip: false,
              profile_image: '/demo/guests/yuki.png'
            }
        ] as any as Guest[];
        return demoGuests;
      }

      // Fetch staff user_ids to exclude from guest list
      let staffRolesQuery: any = supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'moderator', 'staff']);

      if (hotelId) {
        staffRolesQuery = staffRolesQuery.eq('hotel_id', hotelId);
      }

      const { data: staffRoles } = await staffRolesQuery;
      const staffUserIds = new Set((staffRoles || []).map((r) => r.user_id));

      let query: any = supabase.from('guests').select('*');
      if (hotelId) query = query.eq('hotel_id', hotelId);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return (data || []).filter(
        (guest) =>
          guest.guest_type !== 'Staff' &&
          (!guest.user_id || !staffUserIds.has(guest.user_id))
      );
    },
  });

  const today = startOfDay(new Date());

  const getGuestStatus = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return [];
    const checkInDate = startOfDay(new Date(checkIn));
    const checkOutDate = startOfDay(new Date(checkOut));
    const statuses: FilterType[] = [];

    if (isToday(checkInDate)) statuses.push('arrivals-today');
    if (isToday(checkOutDate)) statuses.push('departures-today');
    
    // In-house: Stay includes today (not including those arriving today if we want distinctness, but usually in-house means they have a room)
    if (!isBefore(today, checkInDate) && !isAfter(today, checkOutDate)) {
      statuses.push('in-house');
    }

    // Pre-arrival: Any future arrival
    if (isAfter(checkInDate, today)) {
      statuses.push('pre-arrival');
      
      // 3-Day Arrival: specifically tomorrow through 3 days out
      const diffDays = differenceInDays(checkInDate, today);
      if (diffDays > 0 && diffDays <= 3) {
        statuses.push('arrivals-3d');
      }
    }

    if (isBefore(checkOutDate, today)) statuses.push('past');

    return statuses;
  };

  const filterCounts = useMemo(() => {
    if (isDemo) {
      return {
        all: 247,
        'in-house': 124,
        'arrivals-today': 18,
        'arrivals-3d': 34,
        'pre-arrival': 82,
        'departures-today': 12,
        past: 450,
      };
    }

    const counts: Record<FilterType, number> = {
      all: guests.length,
      'in-house': 0,
      'arrivals-today': 0,
      'arrivals-3d': 0,
      'pre-arrival': 0,
      'departures-today': 0,
      past: 0,
    };

    guests.forEach((guest) => {
      const statuses = getGuestStatus(guest.check_in_date, guest.check_out_date);
      statuses.forEach(status => {
        counts[status]++;
      });
    });

    return counts;
  }, [guests, isDemo]);

  const filteredGuests = useMemo(() => {
    let filtered = guests;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((guest) => {
        const statuses = getGuestStatus(guest.check_in_date, guest.check_out_date);
        return statuses.includes(activeFilter);
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((guest) => {
        const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
        return (
          fullName.includes(query) ||
          guest.email?.toLowerCase().includes(query) ||
          guest.room_number?.toLowerCase().includes(query)
        );
      });
    }

    // Apply tab filter (for new UI)
    if (activeTab === 'vip') {
      filtered = filtered.filter(guest => guest.is_vip);
    }

    return filtered;
  }, [guests, activeFilter, searchQuery, activeTab]);

  const sortedGuests = useMemo(() => {
    return [...filteredGuests].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'check-in-asc':
          if (!a.check_in_date) return 1;
          if (!b.check_in_date) return -1;
          return new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime();
        case 'check-in-desc':
          if (!a.check_in_date) return 1;
          if (!b.check_in_date) return -1;
          return new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime();
        case 'check-out-asc':
          if (!a.check_out_date) return 1;
          if (!b.check_out_date) return -1;
          return new Date(a.check_out_date).getTime() - new Date(b.check_out_date).getTime();
        case 'check-out-desc':
          if (!a.check_out_date) return 1;
          if (!b.check_out_date) return -1;
          return new Date(b.check_out_date).getTime() - new Date(a.check_out_date).getTime();
        default:
          return 0;
      }
    });
  }, [filteredGuests, sortBy]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yy');
  };

  const formatFullDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">

      <ScrollArea className="flex-1">
        <motion.div
          className="p-4 md:p-8 pb-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div 
            id="admin-ob-guests-header"
            variants={itemVariants} 
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Star className="h-3 w-3 fill-amber-500" />
                  VIP Guest Management
                </div>
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground dark:text-white">Guest 360°</h1>
              <p className="text-muted-foreground font-medium text-sm">Real-time guest profiles and stay preferences.</p>
            </div>            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setActiveFilter('all')}
                variant="outline" 
                className={cn(
                  "h-10 px-4 rounded-xl font-bold border-border dark:border-white/5 shadow-sm transition-all text-xs",
                  activeFilter === 'all' ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card/40 dark:bg-zinc-900/40 text-foreground dark:text-white hover:bg-secondary dark:hover:bg-zinc-900"
                )}
              >
                {activeFilter === 'all' ? 'All Guests' : 'Reset Filter'}
              </Button>
              <Button 
                variant="outline"
                className="h-10 px-4 rounded-xl bg-card/40 dark:bg-zinc-900/40 text-muted-foreground hover:text-foreground dark:hover:text-zinc-300 hover:bg-secondary dark:hover:bg-zinc-900 border-border dark:border-white/5 font-bold transition-all text-xs"
              >
                Export PDF
              </Button>
              <Button 
                variant="outline"
                className="h-10 px-4 rounded-xl bg-card/40 dark:bg-zinc-900/40 text-muted-foreground hover:text-foreground dark:hover:text-zinc-300 hover:bg-secondary dark:hover:bg-zinc-900 border-border dark:border-white/5 font-bold transition-all text-xs"
              >
                Export CSV
              </Button>
            </div>
          </motion.div>

          {/* Filters Bar */}
          <motion.div 
            id="admin-ob-guests-filters"
            variants={itemVariants} 
            className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            {filterCards.map((card) => {
              const Icon = card.icon;
              const isActive = activeFilter === card.id;
              
              return (
                <Card 
                  key={card.id}
                  onClick={() => setActiveFilter(isActive ? 'all' : card.id)}
                  className={cn(
                    "bg-card/40 dark:bg-zinc-900/40 backdrop-blur-md border-border dark:border-white/5 shadow-sm dark:shadow-2xl rounded-2xl group hover:bg-secondary/50 dark:hover:bg-zinc-900/60 transition-all cursor-pointer overflow-hidden relative",
                    isActive && "ring-2 ring-primary/20 bg-card/80 dark:bg-zinc-900/80 transition-shadow",
                    isActive && card.cardBgClass
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-white/5 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                  <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-1 relative z-10">
                    <div className={cn(
                      "p-2.5 rounded-xl mb-1 shadow-lg transition-transform group-hover:scale-110",
                      card.bgClass,
                      card.colorClass
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-black text-foreground dark:text-white tracking-tighter">
                      {filterCounts[card.id] || 0}
                    </div>
                    <div className={cn(
                      "text-[10px] font-bold uppercase tracking-widest transition-colors",
                      isActive ? "text-primary dark:text-white" : "text-muted-foreground group-hover:text-foreground dark:group-hover:text-zinc-300"
                    )}>
                      {card.label}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>

          {/* Main Content Area */}
          <motion.div 
            id="admin-ob-guests-table"
            variants={itemVariants}
          >
            <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab} className="space-y-6">
              <TabsList className="bg-secondary/50 dark:bg-zinc-900/50 border border-border dark:border-white/5 p-1 h-12 rounded-xl">
                <TabsTrigger value="all" className="px-6 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-background data-[state=active]:text-foreground rounded-lg shadow-sm">All Guests</TabsTrigger>
                <TabsTrigger value="vip" className="px-6 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-background data-[state=active]:text-foreground rounded-lg shadow-sm">VIP Only</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="m-0 mt-6 focus-visible:outline-none focus-visible:ring-0">
                <Card className="bg-card/40 dark:bg-zinc-900/30 backdrop-blur-xl border border-border dark:border-white/[0.03] rounded-[2rem] overflow-hidden shadow-sm dark:shadow-2xl">
                  {isLoading ? (
                    <div className="p-20 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-muted/30 dark:bg-white/[0.02]">
                        <TableRow className="hover:bg-transparent border-border dark:border-white/[0.05]">
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground h-14">Guest</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground h-14">Type</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground h-14">Room</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground h-14">Stay Period</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground h-14 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedGuests.map((guest) => {
                          const statuses = getGuestStatus(guest.check_in_date, guest.check_out_date);
                          const isInHouse = statuses.includes('in-house');
                          
                          return (
                            <TableRow key={guest.id} className="border-border dark:border-white/[0.03] hover:bg-muted/20 dark:hover:bg-white/[0.02] transition-colors group">
                              <TableCell className="py-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <Avatar className="h-10 w-10 border-2 border-border dark:border-white/10 group-hover:border-primary/50 transition-colors">
                                      <AvatarImage src={guest.profile_image} />
                                      <AvatarFallback className="bg-primary/20 text-primary font-bold">{guest.first_name[0]}{guest.last_name[0]}</AvatarFallback>
                                    </Avatar>
                                    {isInHouse && (
                                      <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background dark:border-zinc-950 flex items-center justify-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <div className="font-bold text-foreground dark:text-white text-[15px]">{guest.first_name} {guest.last_name}</div>
                                      {isInHouse && (
                                        <Badge className="h-4 px-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-tighter">
                                          In-House
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{guest.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn(
                                  "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded",
                                  guest.is_vip ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-secondary dark:bg-zinc-500/10 text-muted-foreground dark:text-zinc-500 border-border dark:border-zinc-500/20"
                                )}>
                                  {guest.is_vip ? 'VIP Executive' : 'Standard'}
                                </Badge>
                              </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground dark:text-zinc-400">
                              {guest.room_number || 'TBA'}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground dark:text-zinc-400 font-medium">
                              {formatDate(guest.check_in_date)} — {formatDate(guest.check_out_date)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/demo/admin/guests/${guest.id}`)} className="text-primary hover:bg-primary/10 font-bold h-8 px-4 rounded-lg">
                                View 360°
                              </Button>
                            </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </ScrollArea>
    </div>
  );
};

export default GuestsManager;
