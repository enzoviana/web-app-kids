import React from 'react';
import { cn } from '@/lib/utils';

export interface GlowBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'lime' | 'magenta';
  pulse?: boolean;
  children: React.ReactNode;
}

export const GlowBadge = React.forwardRef<HTMLSpanElement, GlowBadgeProps>(
  ({ variant = 'cyan', pulse = false, className, children, ...props }, ref) => {
    const variantClass = variant === 'lime'
      ? 'badge-glow-lime'
      : variant === 'magenta'
      ? 'badge-glow-magenta'
      : 'badge-glow-cyan';

    return (
      <span
        ref={ref}
        className={cn(
          variantClass,
          'inline-flex items-center gap-1.5 text-xs font-medium',
          pulse && 'neon-pulse-slow',
          className
        )}
        {...props}
      >
        {pulse && (
          <span className={cn(
            'w-2 h-2 rounded-full',
            variant === 'cyan' && 'bg-cyan-500',
            variant === 'lime' && 'bg-lime-500',
            variant === 'magenta' && 'bg-magenta-500',
            'animate-pulse'
          )} />
        )}
        {children}
      </span>
    );
  }
);

GlowBadge.displayName = 'GlowBadge';
