import React from 'react';
import { cn } from '../utils/cn';
import type { AvatarVariant } from '@/lib/avatars';

interface AvatarProps {
  emoji?: string;
  initials?: string;
  alt?: string;
  variant?: AvatarVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  sm: { container: 'w-8 h-8 min-w-8 min-h-8', emoji: 'text-lg', initials: 'text-[10px]' },
  md: { container: 'w-12 h-12 min-w-12 min-h-12', emoji: 'text-2xl', initials: 'text-xs' },
  lg: { container: 'w-16 h-16 min-w-16 min-h-16', emoji: 'text-3xl', initials: 'text-sm' },
  xl: { container: 'w-20 h-20 min-w-20 min-h-20', emoji: 'text-4xl', initials: 'text-base' },
  '2xl': { container: 'w-24 h-24 min-w-24 min-h-24', emoji: 'text-5xl', initials: 'text-lg' },
};

const variantClasses: Record<AvatarVariant, string> = {
  user: 'bg-gradient-to-br from-primary to-accent text-primary-foreground',
  pet: 'bg-gradient-to-br from-secondary/90 to-accent/90 text-white',
  'provider-walker': 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
  'provider-caregiver': 'bg-gradient-to-br from-secondary to-accent text-white',
  'provider-vet': 'bg-gradient-to-br from-info to-primary text-white',
  marketplace: 'bg-gradient-to-br from-muted to-muted/60 text-foreground',
  default: 'bg-gradient-to-br from-primary to-accent text-primary-foreground',
};

export const Avatar: React.FC<AvatarProps> = ({
  emoji,
  initials,
  alt = '',
  variant = 'default',
  size = 'md',
  className,
}) => {
  const sizes = sizeClasses[size];
  const showInitials = Boolean(initials);
  const showEmoji = !showInitials && Boolean(emoji);

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'flex items-center justify-center shrink-0 overflow-hidden shadow-sm font-semibold select-none aspect-square rounded-full',
        sizes.container,
        variantClasses[variant],
        className,
        // Always enforce circle — overrides any rounded-* passed via className
        'rounded-full'
      )}
    >
      {showInitials && (
        <span className={cn('leading-none tracking-tight', sizes.initials)}>{initials}</span>
      )}
      {showEmoji && (
        <span className={cn('leading-none flex items-center justify-center', sizes.emoji)} aria-hidden>
          {emoji}
        </span>
      )}
    </div>
  );
};
