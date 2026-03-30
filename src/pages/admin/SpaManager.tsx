
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SpaFacilitiesTab from './spa/SpaFacilitiesTab';
import SpaServicesTab from './spa/SpaServicesTab';
import SpaBookingsTab from './spa/SpaBookingsTab';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Waves, Plus, Search, Calendar, Info, RefreshCw, Sparkles, LayoutGrid, List } from "lucide-react";
import { motion } from 'framer-motion';

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
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DemoInstructionOverlay from '@/components/admin/DemoInstructionOverlay';

const SpaCard = ({ facility }) => {
  // Simulated live data for demo
  const occupancy = Math.floor(Math.random() * 30) + 40; // 40-70%
  const isBusy = occupancy > 60;

  return (
    <Card className="overflow-hidden bg-card dark:bg-zinc-900 border-border dark:border-white/5 group hover:border-primary/50 transition-all shadow-sm dark:shadow-2xl relative">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={facility.image_url || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop'} 
          alt={facility.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">ACTIVE</Badge>
          {isBusy && (
            <div className="px-2 py-1 rounded-md bg-rose-500/20 backdrop-blur-md border border-rose-500/30 flex items-center gap-1.5 transition-all animate-pulse">
              <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Peak Trend</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Current Occupancy</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white">{occupancy}%</span>
              <div className="h-1 w-1 rounded-full bg-emerald-500 mb-1" />
            </div>
          </div>
          
          {/* Mini Sparkline SVG */}
          <div className="h-8 w-20 opacity-50 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 100 40" className="h-full w-full">
              <path
                d="M0 25 L10 28 L20 22 L30 35 L40 32 L50 25 L60 15 L70 12 L80 18 L90 22 L100 28"
                fill="none"
                stroke={isBusy ? "#f43f5e" : "#0ea5e9"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="text-lg font-bold text-foreground mb-1">{facility.name}</h3>
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{facility.description || 'Premium wellness facility designed for absolute relaxation and rejuvenation.'}</p>
        <div className="flex items-center justify-between pt-4 border-t border-border dark:border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Live Monitoring</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 px-3 text-primary hover:bg-primary/10 font-bold text-[10px]">Manage</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SpaManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedSpaService, setSelectedSpaService] = useState<string | null>(null);
  const { markSectionSeen } = useAdminNotifications();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isAddSpaOpen, setIsAddSpaOpen] = useState(false);
  const [editingSpa, setEditingSpa] = useState<any>(null);

  React.useEffect(() => {
    if (activeTab === 'bookings') {
      markSectionSeen('spa');
    }
  }, [activeTab, markSectionSeen]);

  const refreshSpaData = () => {
    queryClient.invalidateQueries({ queryKey: ['spa-facilities'] });
    queryClient.invalidateQueries({ queryKey: ['spa-services'] });
    queryClient.invalidateQueries({ queryKey: ['spa-bookings'] });
  };

  React.useEffect(() => {
    refreshSpaData();
  }, []);

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      
      <motion.div 
        className="p-8 pb-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          id="admin-ob-spa-header"
          variants={itemVariants} 
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        >
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Wellness & Spa</h1>
            <p className="text-muted-foreground font-medium text-sm">Orchestrate the ultimate guest relaxation journey.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsAddSpaOpen(true)}
              className="h-12 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold border-none shadow-xl transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Treatment
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card dark:bg-zinc-900/50 border border-border dark:border-white/5 p-1 h-12 rounded-xl">
              <TabsTrigger value="bookings" className="px-6 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Reservations</TabsTrigger>
              <TabsTrigger value="facilities" className="px-6 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Facilities</TabsTrigger>
              <TabsTrigger value="services" className="px-6 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Treatments</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="m-0 mt-6 focus-visible:outline-none focus-visible:ring-0">
              <Card className="bg-card/30 dark:bg-zinc-900/30 backdrop-blur-xl border border-border dark:border-white/[0.03] rounded-[2rem] overflow-hidden shadow-sm dark:shadow-2xl">
                <SpaBookingsTab onServiceSelected={setSelectedSpaService} />
              </Card>
            </TabsContent>

            <TabsContent value="facilities" className="m-0 mt-6 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants}><SpaCard facility={{ name: 'Infinity Pool & Lounge', image_url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2070&auto=format&fit=crop' }} /></motion.div>
                <motion.div variants={itemVariants}><SpaCard facility={{ name: 'Zen Garden Spa', image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop' }} /></motion.div>
                <motion.div variants={itemVariants}><SpaCard facility={{ name: 'Luxury Sauna & Steam', image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop' }} /></motion.div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="m-0 mt-6 focus-visible:outline-none focus-visible:ring-0">
              <SpaServicesTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
