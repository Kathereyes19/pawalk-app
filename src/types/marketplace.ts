export type MarketplaceCategory =
  | 'food'
  | 'grooming'
  | 'toys'
  | 'veterinary'
  | 'services';

export type MarketplaceView =
  | 'home'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'confirmed';

export type MarketplaceOrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface MarketplaceProduct {
  id: string;
  name: string;
  slug: string;
  category: MarketplaceCategory;
  price: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  description: string;
  imageEmoji: string;
  imageUrl?: string | null;
  gallery: string[];
  inStock: boolean;
  tags: string[];
}

export interface MarketplaceProductRow {
  id: string;
  name: string;
  slug: string;
  category: MarketplaceCategory;
  price: number;
  rating: number;
  review_count: number;
  short_description: string;
  description: string;
  image_emoji: string;
  image_url: string | null;
  gallery: string[];
  in_stock: boolean;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CartLineItem {
  productId: string;
  quantity: number;
}

export interface CartProduct extends MarketplaceProduct {
  quantity: number;
  lineTotal: number;
}

export interface MarketplaceOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface MarketplaceOrder {
  id: string;
  userId: string;
  items: MarketplaceOrderItem[];
  subtotal: number;
  deliveryAddress: string;
  paymentMethodLabel: string;
  paymentMethodId?: string | null;
  status: MarketplaceOrderStatus;
  createdAt: string;
}

export interface MarketplaceOrderRow {
  id: string;
  user_id: string;
  items: MarketplaceOrderItem[];
  subtotal: number;
  delivery_address: string;
  payment_method_label: string;
  payment_method_id: string | null;
  status: MarketplaceOrderStatus;
  created_at: string;
  updated_at?: string;
}

export interface MarketplaceFilters {
  search: string;
  category: MarketplaceCategory | 'all';
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStockOnly: boolean;
}

export interface CreateMarketplaceOrderInput {
  deliveryAddress: string;
  paymentMethodLabel: string;
  paymentMethodId?: string | null;
}

export const DEFAULT_MARKETPLACE_FILTERS: MarketplaceFilters = {
  search: '',
  category: 'all',
  minPrice: 0,
  maxPrice: 500000,
  minRating: 0,
  inStockOnly: false,
};
