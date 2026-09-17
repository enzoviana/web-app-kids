import React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  AlertCircle
} from 'lucide-react';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'neutral';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  showIcon?: boolean;
  pulse?: boolean;
  children?: React.ReactNode;
}

const statusConfig: Record<StatusType, {
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  success: {
    icon: CheckCircle,
    className: 'status-badge-success',
  },
  warning: {
    icon: AlertTriangle,
    className: 'status-badge-warning',
  },
  error: {
    icon: XCircle,
    className: 'status-badge-error',
  },
  info: {
    icon: Info,
    className: 'status-badge-info',
  },
  pending: {
    icon: Clock,
    className: 'status-badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600',
  },
  neutral: {
    icon: AlertCircle,
    className: 'status-badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  },
};

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, showIcon = true, pulse = false, className, children, ...props }, ref) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        ref={ref}
        className={cn(
          config.className,
          pulse && 'neon-pulse-slow',
          className
        )}
        {...props}
      >
        {showIcon && <Icon className="w-3.5 h-3.5" />}
        {children}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
