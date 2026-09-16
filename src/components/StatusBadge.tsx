import React from 'react';
import clsx from 'clsx';

export type StatusKey = 'sain' | 'symptome' | 'attention';

interface StatusBadgeProps {
  status: StatusKey;
  className?: string;
}

const statusConfig: Record<StatusKey, { label: string; color: string; bg: string; border: string }> = {
  sain: {
    label: 'En forme',
    color: 'text-lime',
    bg: 'bg-lime/20',
    border: 'border-lime/60',
  },
  symptome: {
    label: 'Symptôme signalé',
    color: 'text-magenta',
    bg: 'bg-magenta/20',
    border: 'border-magenta/60',
  },
  attention: {
    label: 'Surveillance',
    color: 'text-cyan',
    bg: 'bg-cyan/20',
    border: 'border-cyan/60',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill border',
        'backdrop-blur-sm shadow-lg',
        config.bg,
        config.border,
        className
      )}
    >
      {/* Glowing dot */}
      <div
        className={clsx(
          'w-2 h-2 rounded-full',
          config.color.replace('text-', 'bg-'),
          'shadow-[0_0_8px_currentColor]',
          'animate-pulse-subtle'
        )}
        style={{
          boxShadow: `0 0 8px ${config.color.includes('lime') ? '#8BC34A' : config.color.includes('magenta') ? '#FF007A' : '#0099FF'}`,
        }}
      />
      <span className={clsx('text-xs font-bold', config.color)}>{config.label}</span>
    </div>
  );
};
