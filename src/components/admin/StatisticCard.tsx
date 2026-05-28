import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import CountUp from './CountUp';
import { motion } from 'framer-motion';

interface StatisticCardProps {
  id?: string;
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  subtitleColor?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  suffix?: string;
  iconColor?: 'amber' | 'emerald' | 'pink' | 'yellow' | 'blue' | 'purple' | 'green' | 'orange' | 'indigo';
  loading?: boolean;
  className?: string;
  decimals?: number;
  delay?: number;
  size?: 'default' | 'large';
}

const iconGlowMap = {
  amber:   'icon-glow-amber',
  emerald: 'icon-glow-emerald',
  pink:    'icon-glow-pink',
  yellow:  'icon-glow-amber',
  blue:    'icon-glow-blue',
  purple:  'icon-glow-purple',
  green:   'icon-glow-green',
  orange:  'icon-glow-orange',
  indigo:  'icon-glow-indigo',
};

const subtitleColorClasses = {
  default: 'text-muted-foreground',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-orange-500 dark:text-orange-400',
  danger:  'text-red-500 dark:text-red-400',
  info:    'text-blue-500 dark:text-blue-400',
};

const StatisticCard: React.FC<StatisticCardProps> = ({
  id,
  title,
  value,
  icon: Icon,
  subtitle,
  subtitleColor = 'default',
  suffix = '',
  iconColor = 'amber',
  loading = false,
  className,
  decimals = 0,
  delay = 0,
  size = 'default',
}) => {
  if (loading) {
    return (
      <div className={cn('bento-card p-5 h-full', className)}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3 flex-1">
            <div className="h-3 w-20 bg-muted rounded-full animate-pulse" />
            <div className="h-7 w-16 bg-muted rounded-full animate-pulse" />
            <div className="h-2.5 w-14 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn('bento-card p-5 h-full group cursor-default', className)}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Text */}
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              'font-bold text-foreground admin-num',
              size === 'large' ? 'text-4xl' : 'text-2xl'
            )}>
              {typeof value === 'number' ? (
                <CountUp to={value} decimals={decimals} delay={delay} duration={1.4} />
              ) : (
                value
              )}
            </span>
            {suffix && (
              <span className="text-sm text-muted-foreground font-medium">{suffix}</span>
            )}
          </div>
          {subtitle && (
            <p className={cn('text-xs font-medium', subtitleColorClasses[subtitleColor])}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon with glow */}
        <div className={cn(
          'flex items-center justify-center rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110',
          size === 'large' ? 'w-12 h-12' : 'w-10 h-10',
          iconGlowMap[iconColor]
        )}>
          <Icon className={cn(size === 'large' ? 'w-6 h-6' : 'w-5 h-5')} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatisticCard;
