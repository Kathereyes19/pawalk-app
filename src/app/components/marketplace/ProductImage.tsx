import React from 'react';
import { cn } from '@/app/utils/cn';
import { Avatar } from '../Avatar';
import { getProductAvatarProps } from '@/lib/avatars';
import type { MarketplaceProduct } from '@/types';

interface ProductImageProps {
  product: MarketplaceProduct;
  size?: 'card' | 'detail' | 'thumb';
  className?: string;
  emojiOverride?: string;
}

const iconSizes = {
  card: '2xl' as const,
  detail: '2xl' as const,
  thumb: 'lg' as const,
};

const containerHeights = {
  card: 'min-h-[7rem]',
  detail: 'min-h-[12rem]',
  thumb: 'min-h-[4rem]',
};

export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  size = 'card',
  className,
  emojiOverride,
}) => {
  const avatarProps = getProductAvatarProps(product);
  const emoji = emojiOverride ?? avatarProps.emoji;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center bg-gradient-to-br from-primary/8 via-secondary/5 to-accent/8',
        containerHeights[size],
        className
      )}
    >
      <Avatar
        emoji={emoji}
        alt={avatarProps.alt}
        variant="marketplace"
        size={iconSizes[size]}
        className="rounded-2xl shadow-md ring-4 ring-background/80"
      />
    </div>
  );
};
