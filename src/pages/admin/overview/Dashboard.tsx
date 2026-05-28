import React from 'react';
import {
  CalendarCheck, MessageCircle, Users, ClipboardList,
  CheckCircle2, Star, Bot, Utensils, Sparkles, Calendar,
  Clock, LayoutDashboard, TrendingUp, AlertCircle,
} from 'lucide-react';
import { useAdminDashboardStats } from '@/hooks/useAdminDashboardStats';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { motion } from 'framer-motion';
import CountUp from '@/components/admin/CountUp';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { NavLink } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

// ─── Animation variants ──────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
});

// ─── Sub-components ──────────────────────────────────────────────────────────

interface KpiProps {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  sub?: string;
  subColor?: string;
  icon: React.ElementType;
  glowClass: string;
  loading: boolean;
  delay?: number;
}

const KpiCard: React.FC<KpiProps> = ({
  label, value, suffix, decimals = 0, sub, subColor, icon: Icon, glowClass, loading, delay = 0,
}) => {
  if (loading) {
    return (
      <div className="bento-card p-5 flex flex-col gap-3">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-2.5 w-14 rounded-full" />
      </div>
    );
  }
  return (
    <motion.div {...fadeUp(delay)} className="bento-card p-5 group">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground admin-num">
              <CountUp to={value} decimals={decimals} delay={delay} duration={1.4} />
            </span>
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
          {sub && (
            <p className={cn('text-xs font-medium', subColor ?? 'text-muted-foreground')}>{sub}</p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110', glowClass)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

interface RowItemProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  valueColor?: string;
  decimals?: number;
  suffix?: string;
  loading: boolean;
}

const RowItem: React.FC<RowItemProps> = ({ icon: Icon, label, value, valueColor, decimals, suffix, loading }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </div>
    <span className={cn('text-sm font-semibold admin-num', valueColor ?? 'text-foreground')}>
      {loading ? (
        <Skeleton className="h-3.5 w-8 rounded" />
      ) : typeof value === 'number' ? (
        <CountUp to={value} decimals={decimals} duration={1.2} suffix={suffix} />
      ) : (
        value
      )}
    </span>
  </div>
);

// ─── Pending Alert Banner ────────────────────────────────────────────────────

interface AlertBannerProps {
  count: number;
  label: string;
  to: string;
  color: string;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ count, label, to, color }) => {
  const { resolvePath } = useHotelPath();
  if (count === 0) return null;
  return (
    <NavLink
      to={resolvePath(to)}
      className={cn(
        'flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90',
        color
      )}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span><span className="font-bold">{count}</span> {label}</span>
      </div>
      <span className="text-xs opacity-70">View →</span>
    </NavLink>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminDashboardStats();
  const { counts } = useAdminNotifications();

  const pendingServices = stats?.serviceRequests.pending ?? 0;
  const unanswered = stats?.todayActivity.unansweredMessages ?? 0;

  const hasAlerts = pendingServices > 0 || unanswered > 0;

  return (
    <div className="w-full min-h-full p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* ── Page header ── */}
      <motion.div {...fadeUp(0)} className="mb-6">
        <AdminPageHeader
          title="Dashboard"
          description="Live overview of your property"
          icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
        />
      </motion.div>

      {/* ── Alert banners — only shown when there are pending items ── */}
      {hasAlerts && (
        <motion.div {...fadeUp(0.05)} className="space-y-2">
          <AlertBanner
            count={unanswered}
            label="unanswered guest messages"
            to="/admin/chat"
            color="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
          />
          <AlertBanner
            count={pendingServices}
            label="pending service requests"
            to="/admin/housekeeping"
            color="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
          />
        </motion.div>
      )}

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Reservations" value={stats?.totalReservations ?? 0} icon={CalendarCheck}
          glowClass="icon-glow-amber" sub={`${stats?.todayActivity.newReservations ?? 0} today`} loading={isLoading} delay={0.1} />
        <KpiCard label="Current Guests" value={stats?.currentGuests ?? 0} icon={Users}
          glowClass="icon-glow-pink" sub="staying now" loading={isLoading} delay={0.15} />
        <KpiCard label="Messages" value={stats?.messagesCount ?? 0} icon={MessageCircle}
          glowClass="icon-glow-emerald"
          sub={unanswered > 0 ? `${unanswered} unanswered` : 'all answered'}
          subColor={unanswered > 0 ? 'text-orange-500' : 'text-emerald-500'}
          loading={isLoading} delay={0.2} />
        <KpiCard label="Guest Satisfaction" value={stats?.guestSatisfaction ?? 0} decimals={1} suffix="/10"
          icon={Star} glowClass="icon-glow-amber"
          sub={`${stats?.feedbackCount ?? 0} reviews`}
          subColor="text-muted-foreground"
          loading={isLoading} delay={0.25} />
      </div>

      {/* ── Second row: Operations + Activity + AI ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Service Requests */}
        <motion.div {...fadeUp(0.3)} className="bento-card p-5 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
              Service Requests
            </p>
            <div className="icon-glow-orange w-8 h-8 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <RowItem icon={Clock} label="Pending" value={stats?.serviceRequests.pending ?? 0}
            valueColor={pendingServices > 0 ? 'text-orange-500' : 'text-foreground'} loading={isLoading} />
          <RowItem icon={CheckCircle2} label="Completed" value={stats?.serviceRequests.completed ?? 0}
            valueColor="text-emerald-500" loading={isLoading} />
          <RowItem icon={ClipboardList} label="Total" value={stats?.serviceRequests.total ?? 0} loading={isLoading} />
        </motion.div>

        {/* Reservations Breakdown */}
        <motion.div {...fadeUp(0.35)} className="bento-card p-5 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
              Reservations
            </p>
            <div className="icon-glow-blue w-8 h-8 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <RowItem icon={Utensils} label="Dining" value={stats?.tableReservations ?? 0} loading={isLoading} />
          <RowItem icon={Sparkles} label="Spa & Wellness" value={stats?.spaBookings ?? 0} loading={isLoading} />
          <RowItem icon={Calendar} label="Events" value={stats?.eventReservations ?? 0} loading={isLoading} />
        </motion.div>

        {/* AI & Activity */}
        <motion.div {...fadeUp(0.4)} className="bento-card p-5 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
              AI & Messaging
            </p>
            <div className="icon-glow-purple w-8 h-8 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <RowItem icon={Bot} label="AI Conversations" value={stats?.conversationsCount ?? 0} loading={isLoading} />
          <RowItem icon={MessageCircle} label="Messages Today" value={stats?.todayActivity.newMessages ?? 0} loading={isLoading} />
          <RowItem icon={TrendingUp} label="Active Events" value={stats?.activeEvents ?? 0} loading={isLoading} />
        </motion.div>

      </div>

      {/* ── Empty state when no data ── */}
      {!isLoading && stats?.totalReservations === 0 && stats?.messagesCount === 0 && (
        <motion.div {...fadeUp(0.5)} className="bento-card p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl icon-glow-indigo flex items-center justify-center">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">No activity yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Data will appear here as guests interact with your platform — reservations, messages, and service requests.
            </p>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default AdminDashboard;
