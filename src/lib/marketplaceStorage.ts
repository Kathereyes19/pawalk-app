import type { CartLineItem, MarketplaceOrder } from '@/types';

const CART_PREFIX = 'pawalk_marketplace_cart_';
const ORDERS_PREFIX = 'pawalk_marketplace_orders_';
const VIEWED_PREFIX = 'pawalk_marketplace_viewed_';

function cartKey(userId: string): string {
  return `${CART_PREFIX}${userId}`;
}

function ordersKey(userId: string): string {
  return `${ORDERS_PREFIX}${userId}`;
}

export function loadStoredCart(userId: string): CartLineItem[] {
  try {
    const raw = localStorage.getItem(cartKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as CartLineItem[];
  } catch {
    return [];
  }
}

export function saveStoredCart(userId: string, items: CartLineItem[]): void {
  localStorage.setItem(cartKey(userId), JSON.stringify(items));
}

export function loadStoredOrders(userId: string): MarketplaceOrder[] {
  try {
    const raw = localStorage.getItem(ordersKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as MarketplaceOrder[];
  } catch {
    return [];
  }
}

export function saveStoredOrders(userId: string, orders: MarketplaceOrder[]): void {
  localStorage.setItem(ordersKey(userId), JSON.stringify(orders));
}

function viewedKey(userId: string): string {
  return `${VIEWED_PREFIX}${userId}`;
}

export function loadViewedProductIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(viewedKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveViewedProductIds(userId: string, productIds: string[]): void {
  localStorage.setItem(viewedKey(userId), JSON.stringify(productIds.slice(-50)));
}

export function recordViewedProduct(userId: string, productId: string): string[] {
  const existing = loadViewedProductIds(userId).filter((id) => id !== productId);
  const next = [...existing, productId];
  saveViewedProductIds(userId, next);
  return next;
}
