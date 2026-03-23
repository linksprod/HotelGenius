import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Users,
  MessageCircle,
  ClipboardList,
  TrendingUp,
  Globe,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSuperDashboardStats } from '@/hooks/useSuperDashboardStats';
import StatisticCard from '@/components/admin/StatisticCard';
import ActivityChart from '@/components/admin/charts/ActivityChart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import CountUp from '@/components/admin/CountUp';

const SuperDashboard = () => {
  const { data: stats, isLoading } = useSuperDashboardStats();

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

  // Mock trend data
  const platformActivityData = [
    { day: 'Mon', visitors: 1200 },
    { day: 'Tue', visitors: 1500 },
    { day: 'Wed', visitors: 1800 },
    { day: 'Thu', visitors: 1400 },
    { day: 'Fri', visitors: 2000 },
    { day: 'Sat', visitors: 2800 },
    { day: 'Sun', visitors: 2200 },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 h-full">
        <div className="flex-1 space-y-6 p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                <Globe className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Platform Intelligence</h1>
                <p className="text-sm text-muted-foreground">Global oversight for HotelGenius Neural Network</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-tighter">Super Admin Core</span>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Real-time Pulse Card */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-none bg-gradient-to-br from-zinc-900 to-black text-white shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Zap className="h-4 w-4 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Network Status</span>
                      </div>
                      <h2 className="text-3xl font-bold font-mono tracking-tighter">
                        Platform Pulse: {stats?.totalHotels ? 'Optimal' : 'Connecting...'}
                      </h2>
                      <p className="text-zinc-400 text-sm max-w-md">
                        Across {stats?.totalHotels ?? 0} active clusters, the HotelGenius Neural Engine is delivering global guest services with unified AI intelligence.
                      </p>
                    </div>
                    <div className="flex gap-8 items-center">
                      <div className="text-center">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Today's New Hotels</p>
                        <p className="text-2xl font-black text-primary">
                          +<CountUp to={stats?.todayActivity?.newHotels ?? 0} />
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Active Clusters</p>
                        <p className="text-2xl font-black">{stats?.totalHotels ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Stats Grid */}
            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Total Hotels"
                  value={stats?.totalHotels ?? 0}
                  icon={Building2}
                  subtitle="Enterprise Partners"
                  iconColor="blue"
                  loading={isLoading}
                  className="bg-card/40 backdrop-blur-md border-border/50"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Global Guests"
                  value={stats?.totalGuests ?? 0}
                  icon={Users}
                  subtitle={`${stats?.todayActivity?.newGuests ?? 0} joined today`}
                  iconColor="pink"
                  loading={isLoading}
                  className="bg-card/40 backdrop-blur-md border-border/50"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Platform Messages"
                  value={stats?.messagesCount ?? 0}
                  icon={MessageCircle}
                  subtitle="Unified Exchange"
                  iconColor="emerald"
                  loading={isLoading}
                  className="bg-card/40 backdrop-blur-md border-border/50"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="System Load"
                  value={stats?.serviceRequests?.total ?? 0}
                  icon={ClipboardList}
                  subtitle={`${stats?.serviceRequests?.pending ?? 0} active requests`}
                  iconColor="amber"
                  loading={isLoading}
                  className="bg-card/40 backdrop-blur-md border-border/50"
                />
              </motion.div>
            </motion.div>
            
            {/* Detailed Insights Section */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Hotel Directory */}
              <div className="xl:col-span-2">
                <Card className="bg-card/40 backdrop-blur-md border-border/50 h-full overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Hotel Portfolio Insight
                      </CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest">
                      Export Data
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-y border-border/50">
                          <tr>
                            <th className="px-6 py-4">Hotel Cluster</th>
                            <th className="px-6 py-4">Live Guests</th>
                            <th className="px-6 py-4">Total Messages</th>
                            <th className="px-6 py-4">Global Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {stats?.hotelsDetails?.map((hotel) => (
                            <tr key={hotel.id} className="hover:bg-muted/20 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                    {hotel.name[0]}
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs">{hotel.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">{hotel.slug}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-xs">{hotel.guestCount}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-xs">{hotel.messageCount}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[10px] font-bold uppercase text-emerald-500">Active</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8 group-hover:text-primary" onClick={() => window.open(`/${hotel.slug}`, '_blank')}>
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic text-xs">
                                No active clusters found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Global Activity Feed */}
              <div>
                <Card className="bg-card/40 backdrop-blur-md border-border/50 h-full overflow-hidden flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Activity className="h-4 w-4 text-pink-500" />
                      Global Pulse
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto px-6">
                    <div className="space-y-6">
                      {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                        stats.recentActivity.map((activity, i) => (
                          <div key={activity.id} className="flex gap-4 relative">
                            <div className={`h-2 w-2 rounded-full mt-1.5 ${i === 0 ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                            {i < stats.recentActivity.length - 1 && <div className="absolute left-1 top-4 w-[1px] h-10 bg-border/50" />}
                            <div className="space-y-1">
                              <p className="text-xs font-bold leading-none">{activity.description}</p>
                              <p className="text-[10px] text-muted-foreground leading-snug">
                                {activity.type === 'registration' ? 'New member' : 'Guest inquiry'} at {activity.hotelName}
                              </p>
                              <p className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">
                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center text-muted-foreground text-xs italic">
                          No recent activities detected.
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" className="w-full mt-6 text-[10px] font-black uppercase tracking-widest gap-2">
                      View Full Audit Trail
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Platform Growth Section */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="h-full bg-card/40 backdrop-blur-md border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Platform Growth Analytics
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ActivityChart data={stats?.growthData || []} loading={isLoading} />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary">System Notice</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium leading-relaxed">
                      You are in the Super Admin Core. All data shown is aggregated across the entire HotelGenius ecosystem. Use this for strategic capacity planning.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest">Global Capacity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Admin Accounts</span>
                      <span className="text-sm font-bold">{stats?.totalUsers ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Neural Nodes</span>
                      <span className="text-sm font-bold">{stats?.totalHotels ?? 0}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-primary h-full rounded-full w-[65%]" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SuperDashboard;
