import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import CountUp from './CountUp';

interface StatisticCardProps {
  id?: string;
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  subtitleColor?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  suffix?: string;
  iconColor?: 'amber' | 'emerald' | 'pink' | 'yellow' | 'blue' | 'purple' | 'green';
  loading?: boolean;
  className?: string;
  decimals?: number;
  delay?: number;
}

const iconColorClasses = {
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
};

const subtitleColorClasses = {
  default: 'text-muted-foreground',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-orange-600 dark:text-orange-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
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
}) => {
  if (loading) {
    return (
      <Card className="h-full bg-card border shadow-sm">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 sm:h-4 w-20 sm:w-24 bg-muted animate-pulse rounded" />
              <div className="h-6 sm:h-8 w-12 sm:w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 sm:w-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id={id} className={cn("h-full bg-card border shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-lg sm:text-2xl font-bold text-card-foreground">
                {typeof value === 'number' ? (
                  <CountUp 
                    to={value} 
                    decimals={decimals} 
                    delay={delay} 
                    duration={1.5}
                  />
                ) : (
                  value
                )}
              </h3>
              {suffix && <span className="text-xs sm:text-sm text-muted-foreground">{suffix}</span>}
            </div>
            {subtitle && (
              <p className={cn('text-[10px] sm:text-xs', subtitleColorClasses[subtitleColor])}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn('flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full ml-2', iconColorClasses[iconColor])}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticCard;
