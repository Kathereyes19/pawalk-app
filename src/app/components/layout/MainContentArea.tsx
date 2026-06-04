import React, { type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import type { AppLayoutMode } from '@/navigation';

interface MainContentAreaProps {
  layoutMode: AppLayoutMode;
  useFullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

export const MainContentArea: React.FC<MainContentAreaProps> = ({
  layoutMode,
  useFullWidth = false,
  children,
  className,
}) => {
  const usePhoneFrame = layoutMode === 'auth';

  return (
    <main
      className={cn(
        'flex-1 flex min-w-0 h-full overflow-hidden',
        useFullWidth ? 'justify-stretch' : 'justify-center',
        layoutMode === 'admin' && 'bg-background-secondary',
        className
      )}
    >
      <div
        className={cn(
          'w-full h-full bg-background text-foreground overflow-hidden relative',
          useFullWidth
            ? 'max-w-md mx-auto shadow-2xl md:max-w-none md:mx-0 md:shadow-none'
            : usePhoneFrame
              ? 'max-w-md mx-auto shadow-2xl'
              : 'max-w-md mx-auto shadow-2xl md:max-w-none md:mx-0 md:shadow-none'
        )}
      >
        {children}
      </div>
    </main>
  );
};
