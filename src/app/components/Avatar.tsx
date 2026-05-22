import React, { useEffect, useState } from 'react';
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
  alt = '',
  size = 'md',
  className,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl',
    '2xl': 'w-24 h-24 text-5xl',
  };

  const showImage = Boolean(src) && !failed;
  const showEmoji = !showImage && emoji;

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 overflow-hidden shadow-sm relative',
        sizeClasses[size],
        className
      )}
    >
      {showImage && (
        <>
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted/70 to-muted" />
          )}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        </>
      )}
      {showEmoji && <span aria-hidden>{emoji}</span>}
    </div>
  );
};
