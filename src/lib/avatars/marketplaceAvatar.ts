import type { MarketplaceCategory, MarketplaceProduct } from '@/types';
import { MARKETPLACE_CATEGORY_EMOJI } from './constants';
import type { AvatarDisplayProps } from './types';

export function getMarketplaceCategoryEmoji(category: MarketplaceCategory): string {
  return MARKETPLACE_CATEGORY_EMOJI[category] ?? '🐾';
}

export function getProductAvatarProps(product: MarketplaceProduct): AvatarDisplayProps {
  const emoji = product.imageEmoji || getMarketplaceCategoryEmoji(product.category);

  return {
    emoji,
    alt: product.name,
    variant: 'marketplace',
  };
}

export function getProductGalleryEmojis(product: MarketplaceProduct): string[] {
  const categoryIcon = getMarketplaceCategoryEmoji(product.category);
  const gallery = product.gallery.filter((item) => item.length <= 4 && !item.startsWith('http'));

  if (gallery.length > 0) {
    return gallery;
  }

  return [categoryIcon, product.imageEmoji, '🐾'].filter(Boolean);
}
