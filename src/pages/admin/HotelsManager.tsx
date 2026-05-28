import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Settings,
  Calendar,
  Users,
  Hotel,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { toast } from '@/hooks/use-toast';
import CreateHotelDialog from './hotels/CreateHotelDialog';
import { useUserRole } from '@/hooks/useUserRole';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

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
}

// ─── Hotel Card ───────────────────────────────────────────────────────────────

interface HotelCardProps {
  hotel: Hotel;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const primary = hotel.primary_color || '#6366f1';
  const secondary = hotel.secondary_color || '#8b5cf6';
  const initial = (hotel.name?.[0] || 'H').toUpperCase();
  const formattedDate = new Date(hotel.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative flex flex-col rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      {/* Gradient top bar */}
      <div
        className="h-24 flex items-end px-5 pb-0 relative"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        }}
      >
        {/* Avatar */}
        <div
          className="absolute -bottom-5 left-5 h-14 w-14 rounded-xl border-4 border-card flex items-center justify-center text-white font-bold text-xl shadow-lg"
          style={{ backgroundColor: primary }}
        >
          {initial}
        </div>
      </div>

      {/* Card body */}
      <div className="pt-8 px-5 pb-5 flex flex-col gap-3 flex-1">
        {/* Name & slug */}
        <div>
          <h3 className="font-semibold text-base leading-tight truncate">{hotel.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge
              variant="secondary"
              className="text-[11px] font-mono px-2 py-0.5 rounded-full"
            >
              {hotel.slug}
            </Badge>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Created {formattedDate}</span>
          </div>
          {hotel.address && (
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{hotel.address}</span>
            </div>
          )}
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1.5">
          <div
            className="h-4 w-4 rounded-full border-2 border-card shadow-sm"
            style={{ backgroundColor: primary }}
            title="Primary color"
          />
          <div
            className="h-4 w-4 rounded-full border-2 border-card shadow-sm -ml-1.5"
            style={{ backgroundColor: secondary }}
            title="Secondary color"
          />
          <span className="text-[11px] text-muted-foreground ml-1 font-mono">{primary}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex gap-2 pt-1 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs gap-1.5"
            asChild
          >
            <a
              href={`https://hotelgenius.online/${hotel.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visit
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs gap-1.5"
            asChild
          >
            <a
              href={`/${hotel.slug}/admin`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Settings className="h-3.5 w-3.5" />
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
  const [createOpen, setCreateOpen] = useState(false);

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

  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHotels(data || []);
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

  useEffect(() => {
    fetchHotels();
  }, []);

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(search.toLowerCase()) ||
      hotel.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* ── Header ── */}
      <div id="admin-ob-hotels-header" className="mb-6">
        <AdminPageHeader
          title="Hotels Management"
          description="Manage hotel instances and their admins"
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
          {search && (
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

      {/* ── Search ── */}
      <div className="max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search hotels…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
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
              </div>
            </div>
          ))}
        </div>
      ) : filteredHotels.length === 0 ? (
        search ? (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No results for "{search}"</p>
            <p className="text-sm mt-1">Try a different search term</p>
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
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Dialog ── */}
      <CreateHotelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchHotels}
      />
    </div>
  );
};

export default HotelsManager;
