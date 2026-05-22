import React, { useEffect, useState } from 'react';
import { cn } from '@/app/utils/cn';
import { getProductImageUrl } from '@/features/marketplace';
import type { MarketplaceProduct } from '@/types';

interface ProductImageProps {
  product: MarketplaceProduct;
  size?: 'card' | 'detail' | 'thumb';
  className?: string;
  alt?: string;
  srcOverride?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  size = 'card',
  className,
  alt,
  srcOverride,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = srcOverride ?? getProductImageUrl(product, size);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted/70 to-muted" />
      )}
      {!failed ? (
        <img
          src={src}
          alt={alt ?? product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gradient-to-br from-primary/15 to-accent/10">
          {product.imageEmoji}
        </div>
      )}
    </div>
  );
};
