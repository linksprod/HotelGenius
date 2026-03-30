import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CalendarCheck,
  MessageCircle,
  Users,
  PartyPopper,
  ClipboardList,
  CheckCircle2,
  Star,
  Bot,
  Utensils,
  Sparkles,
  Calendar,
  Clock,
  LayoutDashboard,
} from 'lucide-react';
import { useAdminDashboardStats } from '@/hooks/useAdminDashboardStats';
import StatisticCard from '@/components/admin/StatisticCard';
import ActivityChart from '@/components/admin/charts/ActivityChart';
import StatusChart from '@/components/admin/charts/StatusChart';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLandingAnimation from '@/components/admin/AdminLandingAnimation';
import AILiveIntelligence from '@/components/admin/AILiveIntelligence';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import CountUp from '@/components/admin/CountUp';

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

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useAdminDashboardStats();
  const [showLanding, setShowLanding] = React.useState(true);

  const handleLandingComplete = () => {
    setShowLanding(false);
  };

  // Sample data for charts - in production, this would come from the API
  const activityData = [
    { day: 'Mon', visitors: 120 },
    { day: 'Tue', visitors: 150 },
    { day: 'Wed', visitors: 180 },
    { day: 'Thu', visitors: 140 },
    { day: 'Fri', visitors: 200 },
    { day: 'Sat', visitors: 280 },
    { day: 'Sun', visitors: 220 },
  ];

  const statusData = stats?.serviceRequests.total
    ? [
      { name: 'Pending', value: stats.serviceRequests.pending, color: '#f59e0b' },
      { name: 'In Progress', value: Math.max(0, stats.serviceRequests.total - stats.serviceRequests.pending - stats.serviceRequests.completed), color: '#3b82f6' },
      { name: 'Completed', value: stats.serviceRequests.completed, color: '#22c55e' },
    ]
    : [];

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center text-destructive">
          <p>Error loading statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {showLanding && (
        <AdminLandingAnimation onDismiss={handleLandingComplete} />
      )}
      <ScrollArea className="flex-1 h-full">
        <div className={`flex-1 space-y-4 md:space-y-6 p-4 md:p-8 md:pb-0 transition-all duration-500 ${showLanding ? 'blur-sm grayscale-[0.5] opacity-50 overflow-hidden' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
                <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Admin Command Center</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Comprehensive oversight of your property's Neural Network and guest operations.</p>
              </div>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={showLanding ? "hidden" : "visible"}
            className="space-y-6 p-4 md:p-8 pb-0"
          >
            {/* AI Highlights Row */}
            <motion.div variants={itemVariants}>
              <AILiveIntelligence />
            </motion.div>

            {/* Stats Row 1 - Main metrics */}
            <motion.div id="admin-ob-stats" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Total Reservations"
                  value={stats?.totalReservations ?? 0}
                  icon={CalendarCheck}
                  subtitle={`${stats?.todayActivity.newReservations ?? 0} today`}
                  subtitleColor="default"
                  iconColor="amber"
                  loading={isLoading}
                  delay={0.1}
                  className="cursor-pointer hover:bg-muted dark:hover:bg-zinc-800/50 transition-all border-border dark:border-none bg-card dark:bg-zinc-900/40 backdrop-blur-md shadow-sm"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Messages"
                  value={stats?.messagesCount ?? 0}
                  icon={MessageCircle}
                  subtitle={`${stats?.todayActivity.unansweredMessages ?? 0} unanswered`}
                  subtitleColor={stats?.todayActivity.unansweredMessages ? 'danger' : 'default'}
                  iconColor="emerald"
                  loading={isLoading}
                  delay={0.2}
                  className="cursor-pointer hover:bg-muted dark:hover:bg-zinc-800/50 transition-all border-border dark:border-none bg-card dark:bg-zinc-900/40 backdrop-blur-md shadow-sm"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Current Guests"
                  value={stats?.currentGuests ?? 0}
                  icon={Users}
                  subtitle="staying now"
                  subtitleColor="default"
                  iconColor="pink"
                  loading={isLoading}
                  delay={0.3}
                  className="cursor-pointer hover:bg-muted dark:hover:bg-zinc-800/50 transition-all border-border dark:border-none bg-card dark:bg-zinc-900/40 backdrop-blur-md shadow-sm"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Active Events"
                  value={stats?.activeEvents ?? 0}
                  icon={PartyPopper}
                  subtitle={`${stats?.eventReservations ?? 0} total`}
                  subtitleColor="success"
                  iconColor="purple"
                  loading={isLoading}
                  delay={0.4}
                  className="cursor-pointer hover:bg-muted dark:hover:bg-zinc-800/50 transition-all border-border dark:border-none bg-card dark:bg-zinc-900/40 backdrop-blur-md shadow-sm"
                />
              </motion.div>
            </motion.div>

            {/* Stats Row 2 - Secondary metrics */}
            <motion.div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Service Requests"
                  value={stats?.serviceRequests.total ?? 0}
                  icon={ClipboardList}
                  subtitle={`${stats?.serviceRequests.pending ?? 0} pending`}
                  subtitleColor={stats?.serviceRequests.pending ? 'warning' : 'default'}
                  iconColor="yellow"
                  loading={isLoading}
                  delay={0.5}
                  className="cursor-pointer hover:bg-muted dark:hover:bg-zinc-800/50 transition-all border-border dark:border-none bg-card dark:bg-zinc-900/40 backdrop-blur-md shadow-sm"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="Completed Services"
                  value={stats?.serviceRequests.completed ?? 0}
                  icon={CheckCircle2}
                  subtitle="this month"
                  subtitleColor="success"
                  iconColor="green"
                  loading={isLoading}
                  delay={0.6}
                  className="cursor-pointer hover:bg-muted dark:hover:bg-zinc-800/50 transition-all border-border dark:border-none bg-card dark:bg-zinc-900/40 backdrop-blur-md shadow-sm"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  id="admin-ob-satisfaction"
                  title="Guest Satisfaction"
                  value={stats?.guestSatisfaction ?? 0}
                  icon={Star}
                  suffix="/10"
                  subtitle={`${stats?.feedbackCount ?? 0} reviews`}
                  subtitleColor="success"
                  iconColor="amber"
                  loading={isLoading}
                  decimals={1}
                  delay={0.7}
                  className="cursor-pointer hover:bg-muted dark:hover:bg-zinc-800/50 transition-all border-border dark:border-none bg-card dark:bg-zinc-900/40 backdrop-blur-md shadow-sm"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatisticCard
                  title="AI Conversations"
                  value={stats?.conversationsCount ?? 0}
                  icon={Bot}
                  subtitle="total chats"
                  subtitleColor="default"
                  iconColor="blue"
                  loading={isLoading}
                  delay={0.8}
                  className="cursor-pointer hover:bg-muted dark:hover:bg-zinc-800/50 transition-all border-border dark:border-none bg-card dark:bg-zinc-900/40 backdrop-blur-md shadow-sm"
                />
              </motion.div>
            </motion.div>



            {/* Summary Cards */}
            <motion.div variants={itemVariants} id="admin-ob-summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {/* Reservations Breakdown */}
              <Card className="border border-border dark:border-none shadow-sm bg-card dark:bg-zinc-900/40 backdrop-blur-md">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Reservations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground/80">Spa Bookings</span>
                        </div>
                        <span className="text-base font-bold text-foreground">
                          <CountUp to={stats?.spaBookings ?? 0} delay={0.9} />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Utensils className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground/80">Table Reservations</span>
                        </div>
                        <span className="text-base font-bold text-foreground">
                          <CountUp to={stats?.tableReservations ?? 0} delay={1.0} />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground/80">Event Reservations</span>
                        </div>
                        <span className="text-base font-bold text-foreground">
                          <CountUp to={stats?.eventReservations ?? 0} delay={1.1} />
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Today's Activity */}
              <Card className="border border-border dark:border-none shadow-sm bg-card dark:bg-zinc-900/40 backdrop-blur-md">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Today's Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground/80">New Reservations</span>
                        </div>
                        <span className="text-base font-bold text-foreground">
                          <CountUp to={stats?.todayActivity.newReservations ?? 0} delay={1.2} />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground/80">New Messages</span>
                        </div>
                        <span className="text-base font-bold text-foreground">
                          <CountUp to={stats?.todayActivity.newMessages ?? 0} delay={1.3} />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-orange-500" />
                          <span className="text-sm font-medium text-foreground/80">Unanswered</span>
                        </div>
                        <span className="text-base font-bold text-orange-500">
                          <CountUp to={stats?.todayActivity.unansweredMessages ?? 0} delay={1.4} />
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Service Status */}
              <Card className="border border-border dark:border-none shadow-sm bg-card dark:bg-zinc-900/40 backdrop-blur-md">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Service Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-orange-500" />
                          <span className="text-sm font-medium text-foreground/80">Pending</span>
                        </div>
                        <span className="text-base font-bold text-orange-500">
                          <CountUp to={stats?.serviceRequests.pending ?? 0} delay={1.5} />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-sm font-medium text-foreground/80">Completed</span>
                        </div>
                        <span className="text-base font-bold text-green-500">
                          <CountUp to={stats?.serviceRequests.completed ?? 0} delay={1.6} />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-sm font-medium text-foreground/80">Avg. Rating</span>
                        </div>
                        <span className="text-base font-bold text-foreground">
                          <CountUp to={stats?.guestSatisfaction ?? 0} delay={1.7} decimals={1} suffix="/10" />
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Charts Section */}
            <motion.div variants={itemVariants}>
              <h2 className="mb-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Trend Analytics</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ActivityChart data={activityData} loading={isLoading} />
                <StatusChart data={statusData} loading={isLoading} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminDashboard;
