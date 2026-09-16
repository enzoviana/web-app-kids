import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface PrimaryButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'magenta' | 'outline';
  className?: string;
  type?: 'button' | 'submit';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onClick,
  icon,
  loading = false,
  disabled = false,
  variant = 'primary',
  className,
  type = 'button',
}) => {
  const isOutline = variant === 'outline';

  const baseClasses = 'h-[54px] rounded-pill px-5 flex items-center justify-center gap-2 font-extrabold text-base transition-all';

  const variantClasses = {
    primary: 'btn-gradient-cyan hover:shadow-xl active:scale-[0.98]',
    magenta: 'btn-gradient-magenta hover:shadow-xl active:scale-[0.98]',
    outline: 'border-2 border-cyan text-cyan bg-transparent hover:bg-cyan/10 active:scale-[0.98]',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="text-lg">{icon}</span>}
          <span>{label}</span>
        </>
      )}
    </motion.button>
  );
};
