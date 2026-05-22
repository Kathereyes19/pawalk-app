import React, { type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import type { AppLayoutMode } from '@/navigation';

interface MainContentAreaProps {
  layoutMode: AppLayoutMode;
  children: ReactNode;
  className?: string;
}

export const MainContentArea: React.FC<MainContentAreaProps> = ({
  layoutMode,
  children,
  className,
}) => {
  const usePhoneFrame = layoutMode === 'auth';

  return (
    <main
      className={cn(
        'flex-1 flex justify-center min-w-0 h-full overflow-hidden',
        layoutMode === 'admin' && 'bg-background-secondary',
        className
      )}
    >
      <div
        className={cn(
          'w-full h-full bg-background text-foreground overflow-hidden relative',
          usePhoneFrame
            ? 'max-w-md mx-auto shadow-2xl'
            : 'max-w-md mx-auto shadow-2xl md:max-w-none md:mx-0 md:shadow-none'
        )}
      >
        {children}
      </div>
    </main>
  );
};
