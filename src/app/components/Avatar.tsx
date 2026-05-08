import React from 'react';
import { cn } from '../utils/cn';

interface AvatarProps {
  emoji?: string;
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  emoji,
  src,
  alt,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl',
    '2xl': 'w-24 h-24 text-5xl',
  };

  const content = emoji || (src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : null);

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 overflow-hidden shadow-sm',
        sizeClasses[size],
        className
      )}
    >
      {content}
    </div>
  );
};
