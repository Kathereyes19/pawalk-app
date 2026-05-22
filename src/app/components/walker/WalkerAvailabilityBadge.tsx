import { cn } from '../../utils/cn';
import { Clock, Zap } from 'lucide-react';
import type { Walker } from '@/types';
import { formatNextAvailableLabel } from '@/lib/walkers/availability';

interface WalkerAvailabilityBadgeProps {
  walker: Walker;
  locale?: 'es' | 'en';
  size?: 'sm' | 'md';
  className?: string;
  inverse?: boolean;
}

export function WalkerAvailabilityBadge({
  walker,
  locale = 'es',
  size = 'sm',
  className,
  inverse = false,
}: WalkerAvailabilityBadgeProps) {
  const isAvailable = walker.available;
  const nextLabel = formatNextAvailableLabel(walker, locale);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold border',
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
        inverse
          ? isAvailable
            ? 'bg-white/20 text-white border-white/35'
            : 'bg-black/20 text-white/90 border-white/25'
          : isAvailable
            ? 'bg-success/15 text-success border-success/25'
            : 'bg-muted text-muted-foreground border-border',
        className
      )}
    >
      {isAvailable ? (
        <>
          <Zap className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          {locale === 'en' ? 'Available now' : 'Disponible ahora'}
        </>
      ) : (
        <>
          <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          {nextLabel}
        </>
      )}
    </span>
  );
}
