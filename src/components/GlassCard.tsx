import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  onClick?: () => void;
  borderColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  animate = true,
  onClick,
  borderColor,
}) => {
  const Component = animate ? motion.div : 'div';

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: 'easeOut' },
      }
    : {};

  return (
    <Component
      {...animationProps}
      onClick={onClick}
      className={clsx(
        'bg-white/65 dark:bg-white/10',
        'backdrop-blur-[40px]',
        'border border-white/85 dark:border-white/25',
        'rounded-lg shadow-glass',
        'overflow-hidden',
        'p-4',
        onClick && 'cursor-pointer hover:scale-[1.01] transition-transform',
        className
      )}
      style={borderColor ? { borderColor } : undefined}
    >
      {children}
    </Component>
  );
};
