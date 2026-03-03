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

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useAdminDashboardStats();

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
    <div className="flex-1 space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
          <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Real-time statistics and hotel management insights</p>
        </div>
      </div>

      {/* Stats Row 1 - Main metrics */}
      <div id="admin-ob-stats" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatisticCard
          title="Total Reservations"
          value={stats?.totalReservations ?? 0}
          icon={CalendarCheck}
          subtitle={`${stats?.todayActivity.newReservations ?? 0} today`}
          subtitleColor="default"
          iconColor="amber"
          loading={isLoading}
        />
        <StatisticCard
          title="Messages"
          value={stats?.messagesCount ?? 0}
          icon={MessageCircle}
          subtitle={`${stats?.todayActivity.unansweredMessages ?? 0} unanswered`}
          subtitleColor={stats?.todayActivity.unansweredMessages ? 'danger' : 'default'}
          iconColor="emerald"
          loading={isLoading}
        />
        <StatisticCard
          title="Current Guests"
          value={stats?.currentGuests ?? 0}
          icon={Users}
          subtitle="staying now"
          subtitleColor="default"
          iconColor="pink"
          loading={isLoading}
        />
        <StatisticCard
          title="Active Events"
          value={stats?.activeEvents ?? 0}
          icon={PartyPopper}
          subtitle={`${stats?.eventReservations ?? 0} total`}
          subtitleColor="success"
          iconColor="purple"
          loading={isLoading}
        />
      </div>

      {/* Stats Row 2 - Secondary metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatisticCard
          title="Service Requests"
          value={stats?.serviceRequests.total ?? 0}
          icon={ClipboardList}
          subtitle={`${stats?.serviceRequests.pending ?? 0} pending`}
          subtitleColor={stats?.serviceRequests.pending ? 'warning' : 'default'}
          iconColor="yellow"
          loading={isLoading}
        />
        <StatisticCard
          title="Completed Services"
          value={stats?.serviceRequests.completed ?? 0}
          icon={CheckCircle2}
          subtitle="this month"
          subtitleColor="success"
          iconColor="green"
          loading={isLoading}
        />
        <StatisticCard
          title="Guest Satisfaction"
          value={stats?.guestSatisfaction ?? 0}
          icon={Star}
          suffix="/5"
          subtitle={`${stats?.feedbackCount ?? 0} reviews`}
          subtitleColor="success"
          iconColor="amber"
          loading={isLoading}
        />
        <StatisticCard
          title="AI Conversations"
          value={stats?.conversationsCount ?? 0}
          icon={Bot}
          subtitle="total chats"
          subtitleColor="default"
          iconColor="blue"
          loading={isLoading}
        />
      </div>

      {/* Summary Cards */}
      <div id="admin-ob-summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {/* Reservations Breakdown */}
        <Card className="bg-card border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Reservations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Spa Bookings</span>
                  </div>
                  <span className="font-semibold">{stats?.spaBookings ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Table Reservations</span>
                  </div>
                  <span className="font-semibold">{stats?.tableReservations ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Event Reservations</span>
                  </div>
                  <span className="font-semibold">{stats?.eventReservations ?? 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card className="bg-card border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Today's Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">New Reservations</span>
                  </div>
                  <span className="font-semibold">{stats?.todayActivity.newReservations ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">New Messages</span>
                  </div>
                  <span className="font-semibold">{stats?.todayActivity.newMessages ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Unanswered</span>
                  </div>
                  <span className="font-semibold text-orange-600">{stats?.todayActivity.unansweredMessages ?? 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card className="bg-card border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Service Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Pending</span>
                  </div>
                  <span className="font-semibold text-orange-600">{stats?.serviceRequests.pending ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Completed</span>
                  </div>
                  <span className="font-semibold text-green-600">{stats?.serviceRequests.completed ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Avg. Rating</span>
                  </div>
                  <span className="font-semibold">{stats?.guestSatisfaction ?? 0}/5</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Request Status Overview</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ActivityChart data={activityData} loading={isLoading} />
          <StatusChart data={statusData} loading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
