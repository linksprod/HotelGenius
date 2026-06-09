
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SpaFacilitiesTab from './spa/SpaFacilitiesTab';
import SpaServicesTab from './spa/SpaServicesTab';
import SpaBookingsTab from './spa/SpaBookingsTab';
import { Button } from '@/components/ui/button';
import { Waves, Plus, Search, Calendar, Info, RefreshCw, Sparkles, LayoutGrid, List } from "lucide-react";
import { motion } from 'framer-motion';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import SpaServiceDialog from './spa/SpaServiceDialog';
import { useSpaFacilities } from '@/hooks/useSpaFacilities';

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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DemoInstructionOverlay from '@/components/admin/DemoInstructionOverlay';



export default function SpaManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedSpaService, setSelectedSpaService] = useState<string | null>(null);
  const { markSectionSeen } = useAdminNotifications();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { facilities } = useSpaFacilities();
  const [isAddSpaOpen, setIsAddSpaOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          className="mb-8"
        >
          <AdminPageHeader
            title="Wellness & Spa"
            description="Orchestrate the ultimate guest relaxation journey."
            icon={<Waves className="h-5 w-5 text-primary" />}
            actions={
              <Button 
                onClick={() => setIsAddSpaOpen(true)}
                className="h-10 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold border-none shadow-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Treatment
              </Button>
            }
          />
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
              <SpaFacilitiesTab />
            </TabsContent>

            <TabsContent value="services" className="m-0 mt-6 focus-visible:outline-none focus-visible:ring-0">
              <SpaServicesTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      <SpaServiceDialog
        open={isAddSpaOpen}
        onOpenChange={setIsAddSpaOpen}
        service={editingSpa}
        facilities={facilities}
        onClose={(success) => {
          setIsAddSpaOpen(false);
          setEditingSpa(null);
          if (success) refreshSpaData();
        }}
      />
    </div>
  );
}
