import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  ClipboardList, 
  Utensils, 
  Briefcase,
  ExternalLink,
  Settings,
  Calendar
} from 'lucide-react';
import CountUp from '@/components/admin/CountUp';
import StatisticCard from '@/components/admin/StatisticCard';

const SuperHotelDetails = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['super-hotel-details', hotelId],
    queryFn: async () => {
      if (!hotelId) throw new Error('No hotel ID');

      // Fetch hotel info
      const { data: hotel, error: hotelError } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', hotelId)
        .single();
      
      if (hotelError) throw hotelError;

      // Fetch stats
      const [
        { count: guestsCount },
        { count: requestsCount },
        { count: tableResCount },
        { count: spaResCount },
        { count: staffCount }
      ] = await Promise.all([
        supabase.from('guests').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId),
        supabase.from('service_requests').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId),
        supabase.from('table_reservations').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId),
        supabase.from('spa_bookings').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId)
      ]);

      return {
        hotel,
        stats: {
          guests: guestsCount || 0,
          requests: requestsCount || 0,
          reservations: (tableResCount || 0) + (spaResCount || 0),
          staff: staffCount || 0,
        }
      };
    },
    enabled: !!hotelId
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data?.hotel) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Building2 className="h-12 w-12 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-semibold">Hotel not found</h2>
        <Button onClick={() => navigate('/administration/super/hotels')} variant="outline">
          Back to Hotels
        </Button>
      </div>
    );
  }

  const { hotel, stats } = data;
  const primary = hotel.primary_color || '#6366f1';
  const secondary = hotel.secondary_color || '#8b5cf6';
  const initial = (hotel.name?.[0] || 'H').toUpperCase();
  const formattedDate = new Date(hotel.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Dynamic Header */}
      <div 
        className="relative shrink-0 pt-10 pb-6 px-4 md:px-8 shadow-md"
        style={{
          background: `linear-gradient(135deg, ${primary}15 0%, ${secondary}15 100%)`,
          borderBottom: `1px solid ${primary}20`
        }}
      >
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 shrink-0 rounded-full hover:bg-background/80 bg-background/50 backdrop-blur"
              onClick={() => navigate('/administration/super/hotels')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div 
              className="h-16 w-16 shrink-0 rounded-2xl border-4 border-background flex items-center justify-center text-white font-bold text-2xl shadow-xl"
              style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}
            >
              {initial}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{hotel.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="font-mono bg-background/50 px-2 py-0.5 rounded-md border">{hotel.slug}</span>
                {hotel.custom_domain && (
                  <span className="flex items-center gap-1"><ExternalLink className="h-3 w-3"/> {hotel.custom_domain}</span>
                )}
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/> Joined {formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-[4.5rem] md:ml-0">
            <Button
              variant="outline"
              className="gap-2 bg-background/50 backdrop-blur"
              asChild
            >
              <a
                href={`https://${hotel.custom_domain || `hotelgenius.online/${hotel.slug}`}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Live Site
              </a>
            </Button>
            <Button
              className="gap-2"
              asChild
            >
              <a
                href={`/${hotel.slug}/admin`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Settings className="h-4 w-4" />
                Admin Panel
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 w-full space-y-8">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Warning banner for missing info */}
            {(!hotel.address || hotel.address.toUpperCase() === 'TBD') && (
              <motion.div variants={itemVariants}>
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-destructive bg-destructive/10 text-destructive shrink-0 font-bold text-base">?</div>
                  <div>
                    <h4 className="font-bold text-destructive text-sm">Détails manquants</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">La région de cet hôtel n'est pas renseignée (localisation définie à "TBD"). Veuillez éditer cet hôtel pour la corriger.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Total Guests"
                  value={stats.guests}
                  icon={Users}
                  trend={+12}
                  trendLabel="vs last month"
                  loading={isLoading}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Service Requests"
                  value={stats.requests}
                  icon={ClipboardList}
                  trend={+5}
                  trendLabel="active requests"
                  loading={isLoading}
                  valueColor="text-blue-500"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Reservations"
                  value={stats.reservations}
                  icon={Utensils}
                  loading={isLoading}
                  valueColor="text-amber-500"
                  description="Dining & Wellness"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Staff Members"
                  value={stats.staff}
                  icon={Briefcase}
                  loading={isLoading}
                  valueColor="text-emerald-500"
                />
              </motion.div>
            </div>

            {/* General Info Card */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle>Hotel Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                      <p className="font-medium">{hotel.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Identifier (Slug)</p>
                      <p className="font-mono text-sm">{hotel.slug}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                      {(!hotel.address || hotel.address.toUpperCase() === 'TBD') ? (
                        <div className="flex items-center gap-1.5 text-xs text-destructive mt-1 font-semibold">
                          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded border border-destructive bg-destructive/10 text-destructive text-[9px] font-bold">?</span>
                          <span>Région manquante (TBD)</span>
                        </div>
                      ) : (
                        <p className="text-sm">{hotel.address}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Domain</p>
                      <p className="text-sm">{hotel.custom_domain || 'Standard sub-path'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Chain Status</p>
                      <p className="text-sm">{hotel.is_chain ? 'Chain / Group' : 'Independent Property'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Branding Info */}
              <Card className="shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Primary Color</span>
                      <span className="font-mono text-xs">{primary}</span>
                    </div>
                    <div className="h-10 w-full rounded-md shadow-inner" style={{ backgroundColor: primary }}></div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Secondary Color</span>
                      <span className="font-mono text-xs">{secondary}</span>
                    </div>
                    <div className="h-10 w-full rounded-md shadow-inner" style={{ backgroundColor: secondary }}></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SuperHotelDetails;
