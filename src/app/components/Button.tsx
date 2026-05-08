import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'rounded-full font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground shadow-md hover:bg-primary-hover hover:shadow-lg',
    secondary: 'bg-secondary text-secondary-foreground shadow-md hover:bg-secondary-hover hover:shadow-lg',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5 hover:border-primary-hover',
    ghost: 'text-foreground hover:bg-muted hover:text-foreground',
    destructive: 'bg-destructive text-destructive-foreground shadow-md hover:bg-destructive-hover hover:shadow-lg',
    success: 'bg-success text-success-foreground shadow-md hover:shadow-lg',
  };

  const sizeClasses = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-12 px-8 text-base',
    xl: 'h-14 px-10 text-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
};
