import React, { useEffect, useState } from 'react';
import { cn } from '@/app/utils/cn';
import { getProductImageUrl } from '@/features/marketplace';
import { resolveBrandedDefault } from '@/lib/images';
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
        <img
          src={resolveBrandedDefault(product.id, product.name).src}
          alt={alt ?? product.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
};
