import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'lime' | 'magenta';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
};

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ variant = 'cyan', size = 'md', isLoading = false, className, children, disabled, ...props }, ref) => {
    const variantClass = variant === 'lime'
      ? 'btn-gradient-lime'
      : variant === 'magenta'
      ? 'btn-gradient-magenta'
      : 'btn-gradient-cyan';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          variantClass,
          sizeClasses[size],
          'inline-flex items-center justify-center gap-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          variant === 'cyan' && 'focus:ring-cyan-500',
          variant === 'lime' && 'focus:ring-lime-500',
          variant === 'magenta' && 'focus:ring-magenta-500',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

GradientButton.displayName = 'GradientButton';
