import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hoverable = false,
  padding = 'md',
  variant = 'default',
}) => {
  const Component = onClick || hoverable ? motion.div : 'div';
  const motionProps = onClick || hoverable ? {
    whileHover: { y: -2 },
    whileTap: onClick ? { scale: 0.99 } : undefined,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  } : {};

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const variantClasses = {
    default: 'bg-card border border-border shadow-sm',
    bordered: 'bg-card border-2 border-border',
    elevated: 'bg-card shadow-lg border border-border/50',
  };

  return (
    <Component
      className={cn(
        'rounded-2xl transition-all duration-200',
        paddingClasses[padding],
        variantClasses[variant],
        onClick && 'cursor-pointer active:scale-[0.99]',
        hoverable && 'hover:shadow-md',
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
};
