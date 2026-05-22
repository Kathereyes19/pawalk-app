import type {
  CartLineItem,
  MarketplaceCategory,
  MarketplaceOrder,
  MarketplaceOrderItem,
  MarketplaceOrderStatus,
  MarketplaceProduct,
} from '@/types';

const CATEGORY_AFFINITY: Record<MarketplaceCategory, MarketplaceCategory[]> = {
  food: ['food', 'toys', 'grooming'],
  grooming: ['grooming', 'toys', 'food'],
  toys: ['toys', 'food', 'grooming'],
  veterinary: ['veterinary', 'services', 'food'],
  services: ['services', 'veterinary', 'grooming'],
};

const PET_TAG_AFFINITY: Record<string, MarketplaceCategory[]> = {
  perros: ['food', 'toys', 'grooming'],
  gatos: ['food', 'toys', 'grooming'],
  snacks: ['food', 'toys'],
  vacuna: ['veterinary', 'services'],
  salud: ['veterinary', 'services'],
};

export interface RecommendationContext {
  cartItems: CartLineItem[];
  orders: MarketplaceOrder[];
  viewedProductIds: string[];
  productsById: Map<string, MarketplaceProduct>;
  limit?: number;
}

function collectProductSignals(
  productIds: string[],
  productsById: Map<string, MarketplaceProduct>
): { categories: Set<MarketplaceCategory>; tags: Set<string> } {
  const categories = new Set<MarketplaceCategory>();
  const tags = new Set<string>();

  for (const productId of productIds) {
    const product = productsById.get(productId);
    if (!product) continue;
    categories.add(product.category);
    product.tags.forEach((tag) => tags.add(tag.toLowerCase()));
  }

  return { categories, tags };
}

function scoreProduct(
  product: MarketplaceProduct,
  signals: { categories: Set<MarketplaceCategory>; tags: Set<string> },
  excludeIds: Set<string>
): number {
  if (excludeIds.has(product.id) || !product.inStock) return -1;

  let score = product.rating * 2;

  if (signals.categories.has(product.category)) {
    score += 8;
  }

  for (const category of signals.categories) {
    const related = CATEGORY_AFFINITY[category] ?? [];
    if (related.includes(product.category)) {
      score += 4;
    }
  }

  for (const tag of signals.tags) {
    if (product.tags.some((productTag) => productTag.toLowerCase().includes(tag))) {
      score += 3;
    }
    const relatedCategories = PET_TAG_AFFINITY[tag];
    if (relatedCategories?.includes(product.category)) {
      score += 5;
    }
  }

  if (product.reviewCount > 100) score += 2;

  return score;
}

export function getRecommendedProducts(
  products: MarketplaceProduct[],
  context: RecommendationContext
): MarketplaceProduct[] {
  const limit = context.limit ?? 6;
  const excludeIds = new Set<string>([
    ...context.cartItems.map((item) => item.productId),
    ...context.viewedProductIds.slice(-3),
  ]);

  const purchasedIds = context.orders.flatMap((order) =>
    order.items.map((item: MarketplaceOrderItem) => item.productId)
  );
  const viewedIds = context.viewedProductIds;
  const cartIds = context.cartItems.map((item) => item.productId);

  const signals = collectProductSignals(
    [...purchasedIds, ...viewedIds, ...cartIds],
    context.productsById
  );

  if (signals.categories.size === 0 && signals.tags.size === 0) {
    return [...products]
      .filter((product) => product.inStock && !excludeIds.has(product.id))
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
      .slice(0, limit);
  }

  const scored = products
    .map((product) => ({
      product,
      score: scoreProduct(product, signals, excludeIds),
    }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.product);
}
