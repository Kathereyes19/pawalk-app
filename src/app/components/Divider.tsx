import React from 'react';
import { cn } from '../utils/cn';

interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({
  className,
  orientation = 'horizontal',
  text,
}) => {
  if (text && orientation === 'horizontal') {
    return (
      <div className={cn('relative flex items-center py-4', className)}>
        <div className="flex-1 border-t border-border" />
        <span className="px-4 text-sm text-muted-foreground bg-background">
          {text}
        </span>
        <div className="flex-1 border-t border-border" />
      </div>
    );
  }

  if (orientation === 'vertical') {
    return <div className={cn('w-px bg-border h-full', className)} />;
  }

  return <div className={cn('h-px bg-border w-full', className)} />;
};
