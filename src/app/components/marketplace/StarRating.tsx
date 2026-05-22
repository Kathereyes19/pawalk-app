import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/app/utils/cn';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true,
  className,
}) => {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = rating >= index + 1;
          const partial = !filled && rating > index && rating < index + 1;
          return (
            <Star
              key={index}
              className={cn(
                starSize,
                filled || partial
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/30 fill-muted-foreground/20'
              )}
            />
          );
        })}
      </div>
      <span className={cn('font-semibold text-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount != null && (
        <span className="text-xs text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
};
