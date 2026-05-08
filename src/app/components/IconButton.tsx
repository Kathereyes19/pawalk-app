import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'rounded-full transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  const variantClasses = {
    default: 'bg-card border border-border shadow-sm hover:bg-muted',
    primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover',
    ghost: 'hover:bg-muted',
    outline: 'border-2 border-border hover:bg-muted',
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};
