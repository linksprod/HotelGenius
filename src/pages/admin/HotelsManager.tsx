import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Settings,
  Calendar,
  Hotel,
  Edit3,
  Network,
  Users,
  Zap,
  AlertCircle,
  Activity,
  Clock,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { toast } from '@/hooks/use-toast';
import CreateHotelDialog from './hotels/CreateHotelDialog';
import EditHotelDialog from './hotels/EditHotelDialog';
import { useUserRole } from '@/hooks/useUserRole';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Hotel {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  address: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  custom_domain: string | null;
  is_chain?: boolean;
  parent_hotel_id?: string | null;
  active_modules?: string[] | null;
  plan?: string;
  status?: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  essai_en_cours: {
    label: 'Essai en cours',
    className: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  },
  contrat_signe: {
    label: 'Contrat signé',
    className: 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30',
  },
  negociation: {
    label: 'Négociation',
    className: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
  },
  refuse: {
    label: 'Refusé',
    className: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
  },
};

function getStatusConfig(status?: string | null) {
  return STATUS_CONFIG[status || 'essai_en_cours'] ?? STATUS_CONFIG['essai_en_cours'];
}

interface HotelStats {
  activeUsers: number;
  lastAdminActivity: string | null; // ISO date string
  isAdminOnline: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(isoDate: string | null): string | null {
  if (!isoDate) return null;
  try {
    return formatDistanceToNow(new Date(isoDate), { addSuffix: true, locale: fr });
  } catch {
    return null;
  }
}

// ─── Hotel Card ───────────────────────────────────────────────────────────────

interface HotelCardProps {
  hotel: Hotel;
  parentName: string | null;
  stats: HotelStats | undefined;
  onEdit: (hotel: Hotel) => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, parentName, stats, onEdit }) => {
  const primary = hotel.primary_color || '#6366f1';
  const secondary = hotel.secondary_color || '#8b5cf6';
  const initial = (hotel.name?.[0] || 'H').toUpperCase();
  const formattedDate = new Date(hotel.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const navigate = useNavigate();
  const hasActiveUsers = (stats?.activeUsers ?? 0) > 0;
  const lastActivity = formatRelativeTime(stats?.lastAdminActivity ?? null);
  
  // A hotel is considered "Client actif" only if it has guests AND an admin is currently active/online
  const isClientActif = hasActiveUsers && (stats?.isAdminOnline ?? false);

  return (
    <motion.div
      layout
      onClick={() => navigate(`/administration/super/hotels/${hotel.id}`)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative flex flex-col rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Gradient top bar */}
      <div
        className="h-24 flex items-end px-5 pb-0 relative"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        }}
      >
        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {/* Status Badge — contract stage */}
          {(() => {
            const cfg = getStatusConfig(hotel.status);
            return (
              <Badge className={`backdrop-blur-md font-semibold text-[10px] uppercase tracking-wider border ${cfg.className}`}>
                {cfg.label}
              </Badge>
            );
          })()}

          {/* "Client actif" indicator — shown when guests are present and admin has logged in recently */}
          {isClientActif && (
            <Badge className="backdrop-blur-md font-semibold text-[10px] uppercase tracking-wider border bg-blue-500/25 text-blue-100 border-blue-400/40 flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-200" />
              </span>
              Client actif
            </Badge>
          )}
        </div>

        {/* Avatar */}
        <div
          className="absolute -bottom-5 left-5 h-14 w-14 rounded-xl border-4 border-card flex items-center justify-center text-white font-bold text-xl shadow-lg"
          style={{ backgroundColor: primary }}
        >
          {initial}
        </div>

        {/* Badges for chain/sub-hotel */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {hotel.is_chain && (
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md font-semibold text-[10px] uppercase tracking-wider">
              Chain / Group
            </Badge>
          )}
          {parentName && (
            <Badge className="bg-primary/95 text-primary-foreground border-primary/20 text-[10px] font-medium shadow-sm">
              Sub-hotel
            </Badge>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="pt-8 px-5 pb-5 flex flex-col gap-3 flex-1">
        {/* Name & slug */}
        <div>
          <h3 className="font-bold text-base leading-tight text-foreground truncate group-hover:text-primary transition-colors">
            {hotel.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <Badge
              variant="secondary"
              className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            >
              {hotel.slug}
            </Badge>
            {hotel.custom_domain && (
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-background"
              >
                {hotel.custom_domain}
              </Badge>
            )}
          </div>
          {(!hotel.address || hotel.address.toUpperCase() === 'TBD') && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-destructive mt-1.5">
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded border border-destructive bg-destructive/10 text-destructive text-[9px] font-bold">?</span>
              <span>Région manquante</span>
            </div>
          )}
        </div>

        {/* Parent relation details */}
        {parentName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/40">
            <Network className="h-3.5 w-3.5 text-primary/80 shrink-0" />
            <span className="truncate">Part of: <strong className="text-foreground">{parentName}</strong></span>
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Created {formattedDate}</span>
          </div>
          {hotel.address && (
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className={`h-3.5 w-3.5 shrink-0 ${hotel.address.toUpperCase() === 'TBD' ? 'text-amber-500' : ''}`} />
              <span className={`truncate ${hotel.address.toUpperCase() === 'TBD' ? 'text-amber-500 font-semibold' : ''}`}>
                {hotel.address}
              </span>
            </div>
          )}
        </div>

        {/* ── Activity Indicators ───────────────────────────────── */}
        <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30 border border-border/40">
          {/* Active users */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <UserCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{stats?.activeUsers ?? '—'}</span>
              {' '}utilisateur{(stats?.activeUsers ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
          {/* Separator */}
          <div className="h-3.5 w-px bg-border/60" />
          {/* Last admin activity */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Activity className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span className="text-xs text-muted-foreground truncate">
              {lastActivity ? (
                <span title={stats?.lastAdminActivity ?? ''}>
                  <span className="font-medium text-foreground">Admin</span>{' '}
                  {lastActivity}
                </span>
              ) : (
                <span className="italic">Aucune activité</span>
              )}
            </span>
          </div>
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1.5">
          <div
            className="h-4 w-4 rounded-full border border-border shadow-sm"
            style={{ backgroundColor: primary }}
            title="Primary color"
          />
          <div
            className="h-4 w-4 rounded-full border border-border shadow-sm -ml-1.5"
            style={{ backgroundColor: secondary }}
            title="Secondary color"
          />
          <span className="text-[10px] text-muted-foreground ml-1 font-mono">{primary}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs gap-1"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={`https://${hotel.custom_domain || `hotelgenius.online/${hotel.slug}`}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              Visit
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(hotel);
            }}
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-8 text-xs gap-1"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={`/${hotel.slug}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Settings className="h-3 w-3" />
              Admin
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 text-center"
  >
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-5">
      <Hotel className="h-10 w-10 text-primary" />
    </div>
    <h3 className="text-xl font-bold mb-2">No hotels yet</h3>
    <p className="text-muted-foreground text-sm mb-6 max-w-xs">
      Create your first hotel instance to get started with HotelGenius.
    </p>
    <Button onClick={onCreate} className="gap-2">
      <Plus className="h-4 w-4" />
      Create your first hotel
    </Button>
  </motion.div>
);

// ─── HotelsManager ────────────────────────────────────────────────────────────

const HotelsManager: React.FC = () => {
  const { isSuperAdmin } = useUserRole();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterChain, setFilterChain] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [totalGuests, setTotalGuests] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [hotelStatsMap, setHotelStatsMap] = useState<Record<string, HotelStats>>({});

  const getRegion = (address: string | null): string => {
    if (!address) return 'TBD';
    const parts = address.split(',');
    const lastPart = parts[parts.length - 1].trim();
    if (/\d/.test(lastPart) && parts.length > 1) {
      return parts[parts.length - 2].trim();
    }
    return lastPart || 'TBD';
  };

  const getHotelStatus = (hotel: Hotel) => {
    return (hotel.active_modules && hotel.active_modules.length > 0) || hotel.custom_domain ? 'active' : 'inactive';
  };

  const uniqueRegions = Array.from(
    new Set(
      hotels
        .map((h) => (h.address ? getRegion(h.address) : null))
        .filter((r): r is string => !!r && r !== 'TBD')
    )
  ).sort();

  const fetchHotelStats = async (hotelIds: string[]) => {
    if (hotelIds.length === 0) return;

    try {
      // 1. Fetch all users from supabase auth to get actual last_sign_in_at
      const { data: userData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      const userSignInMap = new Map<string, string>();
      if (!usersError && userData?.users) {
        for (const u of userData.users) {
          if (u.id && u.last_sign_in_at) {
            userSignInMap.set(u.id, u.last_sign_in_at);
          }
        }
      }

      // Count guests per hotel and get their status
      const { data: guestsData } = await supabaseAdmin
        .from('guests')
        .select('hotel_id, user_id, status, updated_at')
        .in('hotel_id', hotelIds);

      // Last admin activity: get admins of the hotels
      const { data: adminRoles } = await supabaseAdmin
        .from('user_roles')
        .select('hotel_id, user_id')
        .in('hotel_id', hotelIds)
        .in('role', ['admin', 'hotel_admin']);

      // Build stats map
      const statsMap: Record<string, HotelStats> = {};

      // Initialize all to 0 / null
      for (const id of hotelIds) {
        statsMap[id] = { activeUsers: 0, lastAdminActivity: null, isAdminOnline: false };
      }

      // Count active users per hotel and map guest details by user_id
      const guestUserMap = new Map<string, { status: string | null; updated_at: string | null }>();
      for (const g of guestsData || []) {
        if (g.hotel_id && statsMap[g.hotel_id] !== undefined) {
          statsMap[g.hotel_id].activeUsers += 1;
        }
        if (g.user_id) {
          guestUserMap.set(g.user_id, { status: g.status, updated_at: g.updated_at });
        }
      }

      // Find the most recent last_sign_in_at for each hotel and check if any admin is online
      const latestSignInByHotel = new Map<string, string>();
      for (const r of adminRoles || []) {
        if (r.hotel_id && r.user_id) {
          const signInTime = userSignInMap.get(r.user_id);
          if (signInTime) {
            const existing = latestSignInByHotel.get(r.hotel_id);
            if (!existing || new Date(signInTime) > new Date(existing)) {
              latestSignInByHotel.set(r.hotel_id, signInTime);
            }
          }

          // Check if this admin is online (status === 'online' and updated_at within last 2 hours)
          const profile = guestUserMap.get(r.user_id);
          if (profile && profile.status === 'online') {
            const isRecent = profile.updated_at
              ? (new Date().getTime() - new Date(profile.updated_at).getTime()) < 2 * 60 * 60 * 1000
              : false;
            if (isRecent) {
              statsMap[r.hotel_id].isAdminOnline = true;
            }
          }
        }
      }

      // Map back to statsMap
      for (const [hId, time] of latestSignInByHotel.entries()) {
        if (statsMap[hId]) {
          statsMap[hId].lastAdminActivity = time;
        }
      }

      setHotelStatsMap(statsMap);
    } catch {
      // Non-critical — silently ignore
    }
  };

  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const hotelList = data || [];
      setHotels(hotelList);

      const { count: guestsCount } = await supabaseAdmin
        .from('guests')
        .select('*', { count: 'exact', head: true });
      setTotalGuests(guestsCount || 0);

      // Fetch per-hotel stats
      await fetchHotelStats(hotelList.map((h) => h.id));
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load hotels',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // All hooks must be declared before any conditional return (Rules of Hooks)
  useEffect(() => {
    if (isSuperAdmin) {
      fetchHotels();
    }
  }, [isSuperAdmin]);

  // Hard guard — this page is for super admins only
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          This section is only available to HotelGenius platform administrators.
        </p>
      </div>
    );
  }

  const getParentName = (parentId: string | null | undefined): string | null => {
    if (!parentId) return null;
    const parent = hotels.find((h) => h.id === parentId);
    return parent ? parent.name : null;
  };

  const filteredHotels = hotels.filter((hotel) => {
    // Search
    const matchesSearch =
      hotel.name.toLowerCase().includes(search.toLowerCase()) ||
      hotel.slug.toLowerCase().includes(search.toLowerCase());

    // Chain/Group
    let matchesChain = true;
    if (filterChain === 'chain') {
      matchesChain = !!hotel.is_chain;
    } else if (filterChain === 'independent') {
      matchesChain = !hotel.is_chain && !hotel.parent_hotel_id;
    } else if (filterChain === 'sub_hotel') {
      matchesChain = !hotel.is_chain && !!hotel.parent_hotel_id;
    }

    // Region
    let matchesRegion = true;
    if (filterRegion !== 'all') {
      matchesRegion = getRegion(hotel.address) === filterRegion;
    }

    // Status
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      matchesStatus = getHotelStatus(hotel) === filterStatus;
    }

    return matchesSearch && matchesChain && matchesRegion && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* ── Header ── */}
      <div id="admin-ob-hotels-header" className="mb-6">
        <AdminPageHeader
          title="Hotels Management"
          description="Manage hotel instances, branding, custom domains and chain relations"
          icon={<Building2 className="h-5 w-5 text-primary" />}
          actions={
            <>
              <Button
                variant="outline"
                onClick={fetchHotels}
                disabled={isLoading}
                className="gap-1.5"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create Hotel
              </Button>
            </>
          }
        />
      </div>

      {/* ── KPIs Banner ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hotels */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Hôtels Total</p>
            <h3 className="text-2xl font-bold mt-1 tracking-tight">{hotels.length}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Hotel className="h-5 w-5" />
          </div>
        </div>

        {/* Active Guests */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Clients Actifs</p>
            <h3 className="text-2xl font-bold mt-1 tracking-tight">{totalGuests}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* POC en cours */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">POC en cours</p>
            <h3 className="text-2xl font-bold mt-1 tracking-tight">
              {hotels.filter(h => h.plan === 'essential').length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Zap className="h-5 w-5" />
          </div>
        </div>

        {/* Configurations incomplètes */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Fiches Incomplètes</p>
            <h3 className="text-2xl font-bold mt-1 tracking-tight text-destructive">
              {hotels.filter(h => !h.address || h.address.toUpperCase() === 'TBD').length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      {!isLoading && hotels.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Hotel className="h-4 w-4" />
            <span>
              <span className="font-semibold text-foreground">{hotels.length}</span>{' '}
              {hotels.length === 1 ? 'hotel' : 'hotels'}
            </span>
          </div>
          {(search || filterChain !== 'all' || filterRegion !== 'all' || filterStatus !== 'all') && (
            <div className="flex items-center gap-1.5">
              <span>·</span>
              <span>
                <span className="font-semibold text-foreground">{filteredHotels.length}</span>{' '}
                matching
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Search & Filters ── */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-xl border border-border/60">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search hotels…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Chain/Group Filter */}
          <Select value={filterChain} onValueChange={setFilterChain}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
              <SelectValue placeholder="Type de propriété" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="chain">Chaînes / Groupes</SelectItem>
              <SelectItem value="independent">Indépendants</SelectItem>
              <SelectItem value="sub_hotel">Sous-hôtels</SelectItem>
            </SelectContent>
          </Select>

          {/* Region Filter */}
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
              <SelectValue placeholder="Région" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes régions</SelectItem>
              {uniqueRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset button */}
          {(filterChain !== 'all' || filterRegion !== 'all' || filterStatus !== 'all' || search !== '') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterChain('all');
                setFilterRegion('all');
                setFilterStatus('all');
                setSearch('');
              }}
              className="h-9 px-2 text-muted-foreground hover:text-foreground text-xs"
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card overflow-hidden animate-pulse">
              <div className="h-24 bg-muted" />
              <div className="p-5 pt-8 space-y-3">
                <div className="h-5 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
                <div className="h-8 w-full bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredHotels.length === 0 ? (
        (search || filterChain !== 'all' || filterRegion !== 'all' || filterStatus !== 'all') ? (
          <div className="text-center py-20 text-muted-foreground bg-card border border-dashed rounded-2xl">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No results found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        )
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence>
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                parentName={getParentName(hotel.parent_hotel_id)}
                stats={hotelStatsMap[hotel.id]}
                onEdit={setEditingHotel}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Dialogs ── */}
      <CreateHotelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchHotels}
      />

      <EditHotelDialog
        hotel={editingHotel}
        allHotels={hotels}
        open={!!editingHotel}
        onOpenChange={(open) => !open && setEditingHotel(null)}
        onSuccess={fetchHotels}
      />
    </div>
  );
};

export default HotelsManager;
