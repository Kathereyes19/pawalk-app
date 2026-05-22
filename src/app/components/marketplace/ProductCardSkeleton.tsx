import React from 'react';
import { cn } from '@/app/utils/cn';

export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('rounded-2xl overflow-hidden border border-border bg-card', className)}>
    <div className="h-40 animate-pulse bg-gradient-to-br from-muted via-muted/60 to-muted" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-muted rounded-lg animate-pulse w-4/5" />
      <div className="h-3 bg-muted rounded-lg animate-pulse w-full" />
      <div className="flex justify-between pt-2">
        <div className="h-5 bg-muted rounded-lg animate-pulse w-1/3" />
        <div className="h-4 bg-muted rounded-lg animate-pulse w-1/4" />
      </div>
      <div className="h-9 bg-muted rounded-xl animate-pulse w-full mt-2" />
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);
