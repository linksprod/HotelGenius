import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Zap, 
  Cpu, 
  Shield, 
  Activity, 
  History, 
  Brain, 
  Settings2,
  CheckCircle2,
  Clock,
  Sparkles,
  Command,
  Database,
  Eye,
  Loader2,
  Upload,
  FileText,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from '@/components/admin/CountUp';
import { cn } from '@/lib/utils';
import { useAIConciergeData } from '@/hooks/admin/useAIConciergeData';
import { useKnowledgeBase } from '@/hooks/admin/useKnowledgeBase';
import { AISettingsDialog } from './components/AISettingsDialog';

const AIConcierge = () => {
  const { data: aiData, isLoading: isStatsLoading } = useAIConciergeData();
  const { docs, isProcessing, uploadKnowledge, deleteKnowledge, refresh, isLoading: isKnowledgeLoading } = useKnowledgeBase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'knowledge'>('general');
  
  const [activePermissions, setActivePermissions] = useState({
    diningReservations: true,
    spaBookings: true,
    maintenanceRequests: true,
    roomServiceOrders: true,
    guestInquiries: true,
    transportation: false,
    earlyCheckIn: true
  });


  const togglePermission = (key: keyof typeof activePermissions) => {
    setActivePermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const performanceStats = [
    { title: "Active Conversations", value: aiData?.activeConversations ?? 0, icon: Bot, color: "text-blue-500", bg: "bg-blue-500/10", delay: 0.1 },
    { title: "Requests Automated", value: aiData?.totalAutomatedRequests ?? 0, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", delay: 0.2 },
    { title: "Avg Response Time", value: aiData?.avgResponseTime ?? 1.2, icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10", suffix: "s", delay: 0.3, decimals: 1 },
    { title: "Success Rate", value: aiData?.successRate ?? 99.4, icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-500/10", suffix: "%", delay: 0.4, decimals: 1 }
  ];

  const recentIntelligence = aiData?.recentIntelligence ?? [];

  const mission = "Exceeding guest expectations through seamless service orchestration and proactive hospitality intelligence.";

  if (isStatsLoading && !aiData) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em]">Syncing Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-8 space-y-8">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                  Autonomous Mode Active
                </Badge>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Live Operations</span>
                </div>
              </div>
              <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                AI Concierge Control
              </h1>
              <p className="text-zinc-500 font-medium">Monitoring and orchestrating guest experiences in real-time.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-bold h-11 px-6 rounded-xl">
                <History className="mr-2 h-4 w-4" /> View Full Logs
              </Button>
              <Button 
                onClick={() => { setSettingsTab('general'); setIsSettingsOpen(true); }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-black h-11 px-6 rounded-xl shadow-xl shadow-primary/10"
              >
                <Settings2 className="mr-2 h-4 w-4" /> Agent Settings
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Mission */}
            <div className="lg:col-span-2 space-y-8">
              {/* Performance Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {performanceStats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stat.delay }}
                  >
                    <Card className="bg-card/50 dark:bg-zinc-900/40 border-border dark:border-white/5 backdrop-blur-xl overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
                      <CardContent className="p-5 space-y-2">
                        <div className={cn("p-2 w-fit rounded-lg", stat.bg)}>
                          <stat.icon className={cn("h-4 w-4", stat.color)} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stat.title}</p>
                          <div className="text-2xl font-black flex items-baseline gap-1">
                            <CountUp 
                              to={stat.value} 
                              decimals={stat.decimals || 0} 
                              duration={2} 
                              delay={stat.delay + 0.5} 
                            />
                            {stat.suffix && <span className="text-sm text-muted-foreground">{stat.suffix}</span>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Mission & Profile Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 border-border dark:border-white/5 overflow-hidden relative group shadow-lg">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Bot className="h-48 w-48 rotate-12" />
                  </div>
                  <CardHeader className="relative z-10 p-8 pb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Bot className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black tracking-tight">Agent "Aura"</CardTitle>
                        <CardDescription className="text-muted-foreground font-medium">Lead AI Concierge & Guest Liaison</CardDescription>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Core Mission</span>
                        <p className="text-xl font-medium leading-relaxed italic text-zinc-800 dark:text-zinc-200">
                          "{mission}"
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 p-8 pt-4 flex flex-wrap gap-3">
                    <Badge variant="outline" className="bg-white/10 dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground">Multilingual (24 Languages)</Badge>
                    <Badge variant="outline" className="bg-white/10 dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground">F&B Specialist</Badge>
                    <Badge variant="outline" className="bg-white/10 dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground">Pms Integrated</Badge>
                    <Badge variant="outline" className="bg-white/10 dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground">Autonomous Booking Enabled</Badge>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Intelligence Stream */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Brain className="h-3 w-3" /> Live Intelligence Stream
                  </h3>
                  <Button variant="link" className="text-primary text-[10px] font-bold p-0 h-auto">Refresh Feed</Button>
                </div>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {recentIntelligence.map((log, idx) => {
                      const IconComponent = {
                        dining: Cpu,
                        maintenance: Activity,
                        concierge: Sparkles,
                        spa: Sparkles,
                        system: Shield
                      }[log.type] || Bot;

                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 + 0.8 }}
                          className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-white/[0.03] p-4 rounded-xl flex items-center gap-4 group hover:bg-zinc-100 dark:hover:bg-white/[0.02] transition-all shadow-sm"
                        >
                          <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-primary transition-colors">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-snug line-clamp-1">{log.message}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold uppercase">{log.type}</span>
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-700 tabular-nums">{log.time}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg text-zinc-500 hover:text-white transition-all">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right Column: Control & Permissions */}
            <div className="space-y-8">
              {/* Permissions Control */}
              <Card className="bg-card/50 dark:bg-zinc-900/40 border-border dark:border-white/5 backdrop-blur-xl h-fit shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-black uppercase tracking-widest">Autonomous Control</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Define agent permissions and mission scope.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-5">
                    {[
                      { key: 'guestInquiries', label: '24/7 Guest Inquiries', sub: 'Instant handling of general questions.' },
                      { key: 'diningReservations', label: 'Culinary Bookings', sub: 'Independent restaurant table management.' },
                      { key: 'spaBookings', label: 'Spa & Wellness', sub: 'Managing treatments and therapy slots.' },
                      { key: 'roomServiceOrders', label: 'Room Service Orchestration', sub: 'Ordering and order tracking.' },
                      { key: 'maintenanceRequests', label: 'Auto-Maintenance Dispatch', sub: 'Resolving issues via staff alerts.' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-foreground">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{item.sub}</p>
                        </div>
                        <Switch 
                          checked={activePermissions[item.key as keyof typeof activePermissions]} 
                          onCheckedChange={() => togglePermission(item.key as keyof typeof activePermissions)}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-white/5">
                    <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/10 space-y-3">
                      <div className="flex items-center gap-2 text-amber-500">
                        <Command className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Command Override</span>
                      </div>
                      <p className="text-[10px] text-amber-500/60 leading-normal">
                        Manual intervention mode is available for high-value guest escalations.
                      </p>
                      <Button className="w-full bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 font-bold text-[10px] py-1 h-8 rounded-lg">
                        Enable Safety Lock
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Knowledge Core Management */}
              <Card className="bg-card/50 dark:bg-zinc-900/40 border-border dark:border-white/5 h-fit shadow-lg group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-primary">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">Knowledge Core</CardTitle>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight italic">AI Training Base</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase">{docs.length} Active Records</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
                    Sync hotel fact sheets and service guides to expand the HotelGenius Neural Engine's contextual accuracy for this property.
                  </p>

                  <Button 
                    variant="outline" 
                    className="w-full border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase text-[10px] h-14 rounded-xl tracking-[0.2em] shadow-sm hover:shadow-md transition-all"
                    onClick={() => { setSettingsTab('knowledge'); setIsSettingsOpen(true); }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Train Knowledge Base
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>

      <AISettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        defaultTab={settingsTab}
      />
    </div>
  );
};

export default AIConcierge;
