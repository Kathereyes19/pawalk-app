import React from 'react';
import { cn } from '../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  icon,
  helperText,
  className,
  disabled,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 font-medium text-sm text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-12 px-4 rounded-xl bg-input-background border border-input-border',
            'text-base text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted',
            icon && 'pl-11',
            error && 'border-destructive focus:ring-destructive/20 focus:border-destructive',
            success && 'border-success focus:ring-success/20 focus:border-success',
            className
          )}
          disabled={disabled}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p className={cn(
          'mt-2 text-xs',
          error ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
