import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './glass-card';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  variant?: 'cyan' | 'lime' | 'magenta' | 'neutral';
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, description, icon: Icon, variant = 'neutral', trend, className, ...props }, ref) => {
    const variantColors = {
      cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30',
      lime: 'text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/30',
      magenta: 'text-magenta-600 dark:text-magenta-400 bg-magenta-50 dark:bg-magenta-950/30',
      neutral: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
    };

    return (
      <GlassCard ref={ref} hover className={cn('p-6', className)} {...props}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-2">{value}</h3>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={cn(
                  'text-xs font-semibold',
                  trend.isPositive
                    ? 'text-lime-600 dark:text-lime-400'
                    : 'text-magenta-600 dark:text-magenta-400'
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-500">{trend.label}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              variantColors[variant]
            )}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </GlassCard>
    );
  }
);

StatCard.displayName = 'StatCard';
