import type { MarketplaceProduct } from '@/types';
import { getMarketplaceCategoryEmoji, getProductGalleryEmojis } from '@/lib/avatars';

/** @deprecated Product images removed — returns category emoji for compatibility */
export function buildProductImageUrl(_photoId: string, _width = 600, _height = 450): string {
  return '';
}

/** @deprecated Use getProductAvatarProps from @/lib/avatars */
export function getProductImageUrl(product: MarketplaceProduct): string {
  return getMarketplaceCategoryEmoji(product.category);
}

/** @deprecated Use getProductGalleryEmojis from @/lib/avatars */
export function getProductGalleryUrls(product: MarketplaceProduct): string[] {
  return getProductGalleryEmojis(product);
}

export function enrichMarketplaceProduct(product: MarketplaceProduct): MarketplaceProduct {
  return {
    ...product,
    imageUrl: null,
    gallery: getProductGalleryEmojis(product),
  };
}

export function enrichMarketplaceProducts(products: MarketplaceProduct[]): MarketplaceProduct[] {
  return products.map(enrichMarketplaceProduct);
}
