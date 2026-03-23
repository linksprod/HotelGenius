
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PartyPopper, Sparkles, History, Calendar } from 'lucide-react';
import { EventsTab } from './components/events/EventsTab';
import { StoriesTab } from './components/events/StoriesTab';
import { EventReservationsTab } from './components/events/EventReservationsTab';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const EventsManager = () => {
  const [selectedEventId, setSelectedEventId] = React.useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = React.useState('events');
  const { markSectionSeen } = useAdminNotifications();

  React.useEffect(() => {
    if (activeTab === 'reservations') {
      markSectionSeen('events');
    }
  }, [activeTab, markSectionSeen]);

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      <ScrollArea className="flex-1">
        <motion.div 
          className="p-8 pb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div 
            id="admin-ob-events-header" 
            variants={itemVariants}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Experience Management
                </div>
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground">Entertainment Hub</h1>
              <p className="text-muted-foreground font-medium text-sm">Curate events, manage bookings, and publish stories.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 px-4 rounded-xl bg-card dark:bg-zinc-900/40 border border-border dark:border-white/5 backdrop-blur-md flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Live: Jazz Night (80%)</span>
              </div>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <motion.div variants={itemVariants}>
              <TabsList className="bg-card dark:bg-zinc-900/40 border border-border dark:border-white/5 p-1 rounded-xl h-14 backdrop-blur-md">
                <TabsTrigger value="events" className="rounded-lg data-[state=active]:bg-foreground data-[state=active]:text-background px-8 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <PartyPopper className="h-3.5 w-3.5" />
                  Active Events
                </TabsTrigger>
                <TabsTrigger value="reservations" className="rounded-lg data-[state=active]:bg-foreground data-[state=active]:text-background px-8 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Reservations
                </TabsTrigger>
                <TabsTrigger value="stories" className="rounded-lg data-[state=active]:bg-foreground data-[state=active]:text-background px-8 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <History className="h-3.5 w-3.5" />
                  Stories
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <motion.div variants={itemVariants}>
              <TabsContent value="events" className="mt-0 outline-none">
                <EventsTab />
              </TabsContent>

              <TabsContent value="reservations" className="mt-0 outline-none">
                <EventReservationsTab
                  selectedEventId={selectedEventId}
                  setSelectedEventId={setSelectedEventId}
                />
              </TabsContent>

              <TabsContent value="stories" className="mt-0 outline-none">
                <StoriesTab />
              </TabsContent>
            </motion.div>
          </Tabs>
        </motion.div>
      </ScrollArea>
    </div>
  );
};

export default EventsManager;
