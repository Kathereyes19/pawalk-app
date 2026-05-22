import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';

interface ChipButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

/**
 * Pill-shaped selection chip — matches Button rounded-full system used across Pawalk.
 */
export const ChipButton: React.FC<ChipButtonProps> = ({
  active = false,
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => (
  <motion.button
    type="button"
    whileTap={{ scale: disabled ? 1 : 0.97 }}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200',
      'touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      size === 'sm' ? 'h-9 px-4 text-xs' : 'h-11 px-5 text-sm',
      active
        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-hover'
        : 'bg-card text-foreground border-2 border-border hover:border-primary/30 hover:bg-primary/5',
      className
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </motion.button>
);

/** Shared classes for icon-only controls on gradient headers (marketplace, checkout). */
export const headerIconButtonClassName =
  'bg-white/20 text-white hover:bg-white/30 border-0 min-w-11 min-h-11 w-11 h-11';
