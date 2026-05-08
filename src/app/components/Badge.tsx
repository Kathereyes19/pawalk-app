import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'default' | 'primary' | 'destructive';
  verified?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  verified = false,
  removable = false,
  onRemove,
  size = 'md',
  className,
}) => {
  const variantClasses = {
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    info: 'bg-info/10 text-info border border-info/20',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
    default: 'bg-muted text-muted-foreground border border-border',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {verified && <CheckCircle2 className="w-3.5 h-3.5" />}
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
