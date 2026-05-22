import type { MarketplaceBrowseCategory, MarketplaceProduct } from '@/types';

export const MARKETPLACE_BROWSE_CATEGORIES: MarketplaceBrowseCategory[] = [
  'dogs',
  'cats',
  'food',
  'health',
  'toys',
  'grooming',
];

function hasTag(product: MarketplaceProduct, tag: string): boolean {
  return product.tags.some((entry) => entry.toLowerCase().includes(tag));
}

export function matchesBrowseCategory(
  product: MarketplaceProduct,
  browseCategory: MarketplaceBrowseCategory
): boolean {
  switch (browseCategory) {
    case 'dogs':
      return (
        hasTag(product, 'perro') ||
        (product.category !== 'veterinary' &&
          !hasTag(product, 'gato') &&
          !hasTag(product, 'rascador') &&
          product.id !== 'mp_food_3' &&
          product.id !== 'mp_toy_3')
      );
    case 'cats':
      return hasTag(product, 'gato') || hasTag(product, 'rascador') || product.id === 'mp_food_3';
    case 'food':
      return product.category === 'food';
    case 'health':
      return product.category === 'veterinary';
    case 'toys':
      return product.category === 'toys';
    case 'grooming':
      return (
        product.category === 'grooming' ||
        (product.category === 'services' && (hasTag(product, 'domicilio') || hasTag(product, 'servicio')))
      );
    default:
      return true;
  }
}
