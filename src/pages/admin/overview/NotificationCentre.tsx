import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Brain, 
  Utensils, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

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



import { useNotificationFeed, NotificationItem } from '@/hooks/admin/useNotificationFeed';

const NotificationCentre: React.FC = () => {
  const { data: notifications, isLoading, error } = useNotificationFeed();
  const [activeCategory, setActiveCategory] = React.useState('All Alerts');

  const filteredNotifications = React.useMemo(() => {
    const raw = notifications || [];
    if (activeCategory === 'All Alerts') return raw;
    return raw.filter(n => {
      if (activeCategory === 'AI Insights') return n.type === 'ai';
      if (activeCategory === 'VIP & Guest') return n.type === 'guest';
      if (activeCategory === 'F&B Trends') return n.type === 'f&b';
      if (activeCategory === 'Security') return n.type === 'ops' && n.category === 'Security';
      if (activeCategory === 'Maintenance') return n.type === 'ops' && n.category === 'Maintenance';
      return true;
    });
  }, [activeCategory, notifications]);

  const categories = ['All Alerts', 'AI Insights', 'VIP & Guest', 'F&B Trends', 'Security', 'Maintenance'];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Sparkles className="h-12 w-12 text-rose-500 animate-pulse" />
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em]">Syncing Intelligence Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-background text-foreground overflow-x-hidden">
      <motion.div 
        className="p-8 max-w-[1200px] mx-auto space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <AdminPageHeader
            title="Notification Centre"
            description="Real-time synchronization of AI insights, guest movements, and high-impact operational alerts."
            icon={<Bell className="h-5 w-5 text-primary" />}
            actions={
              <div className="flex items-center gap-3">
                <Button variant="outline" className="h-10 px-4 gap-2 bg-card dark:bg-zinc-900 border-border dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground rounded-xl shadow-sm">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button className="h-10 px-4 gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark All Read
                </Button>
              </div>
            }
          />
        </motion.div>

        {/* Categories Bar */}
        <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                activeCategory === cat
                  ? "bg-foreground text-background border-foreground" 
                  : "bg-card dark:bg-zinc-900 text-muted-foreground border-border dark:border-white/5 hover:border-rose-500/30"
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Notifications List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {filteredNotifications.map((notif) => (
            <Card key={notif.id} className="group relative overflow-hidden border border-border dark:border-white/5 bg-card/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={cn("p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-110", notif.bgColor, notif.color)}>
                    <notif.icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", notif.color)}>
                        {notif.category}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-border dark:bg-zinc-800" />
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {notif.time}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-rose-500 transition-colors">
                      {notif.title}
                    </h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-3xl">
                      {notif.description}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex flex-col items-end gap-4">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    {notif.id === '1' && (
                       <Badge className="bg-rose-500/10 text-rose-500 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase">
                         Action Required
                       </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Load More */}
        <motion.div variants={itemVariants} className="flex justify-center pt-8">
           <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-bold gap-2">
             <Clock className="h-4 w-4" />
             View Notification History
           </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotificationCentre;
