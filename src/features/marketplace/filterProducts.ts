import type { MarketplaceFilters, MarketplaceProduct } from '@/types';
import { matchesBrowseCategory } from './browseCategories';

export function filterMarketplaceProducts(
  products: MarketplaceProduct[],
  filters: MarketplaceFilters
): MarketplaceProduct[] {
  const query = filters.search.trim().toLowerCase();

  return products.filter((product) => {
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    if (
      filters.browseCategory !== 'all' &&
      !matchesBrowseCategory(product, filters.browseCategory)
    ) {
      return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) {
      return false;
    }
    if (product.rating < filters.minRating) {
      return false;
    }
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }
    if (!query) return true;

    const haystack = [
      product.name,
      product.shortDescription,
      product.description,
      ...product.tags,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function getMarketplacePriceBounds(products: MarketplaceProduct[]): {
  min: number;
  max: number;
} {
  if (products.length === 0) return { min: 0, max: 500000 };
  const prices = products.map((product) => product.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
