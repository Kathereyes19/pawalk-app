import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import { MARKETPLACE_CATALOG } from './catalog';
import { createInitialTrackingSteps } from './orderTracking';
import { loadStoredOrders, saveStoredOrders } from '@/lib/marketplaceStorage';
import type {
  CreateMarketplaceOrderInput,
  MarketplaceOrder,
  MarketplaceOrderRow,
  MarketplaceProduct,
  MarketplaceProductRow,
} from '@/types';

function ensureId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function mapRowToProduct(row: MarketplaceProductRow): MarketplaceProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: Number(row.price),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    shortDescription: row.short_description,
    description: row.description,
    imageEmoji: row.image_emoji,
    imageUrl: row.image_url,
    gallery: row.gallery ?? [],
    inStock: row.in_stock,
    tags: row.tags ?? [],
  };
}

function normalizeOrder(order: MarketplaceOrder): MarketplaceOrder {
  const createdAt = order.createdAt;
  return {
    ...order,
    trackingSteps: order.trackingSteps?.length
      ? order.trackingSteps
      : createInitialTrackingSteps(createdAt),
    updatedAt: order.updatedAt ?? createdAt,
  };
}

function mapRowToOrder(row: MarketplaceOrderRow): MarketplaceOrder {
  return normalizeOrder({
    id: row.id,
    userId: row.user_id,
    items: row.items,
    subtotal: Number(row.subtotal),
    deliveryAddress: row.delivery_address,
    paymentMethodLabel: row.payment_method_label,
    paymentMethodId: row.payment_method_id,
    status: row.status,
    trackingSteps: row.tracking_steps ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  });
}

export async function fetchMarketplaceProducts(): Promise<{
  products: MarketplaceProduct[];
  error: Error | null;
}> {
  if (!isSupabaseConfigured()) {
    return { products: MARKETPLACE_CATALOG, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { products: MARKETPLACE_CATALOG, error: null };
  }

  const { data, error } = await supabase
    .from('marketplace_products')
    .select('*')
    .order('name', { ascending: true });

  if (error || !data?.length) {
    return { products: MARKETPLACE_CATALOG, error: error ? new Error(error.message) : null };
  }

  return { products: (data as MarketplaceProductRow[]).map(mapRowToProduct), error: null };
}

export async function fetchMarketplaceOrdersByUserId(
  userId: string
): Promise<{ orders: MarketplaceOrder[]; error: Error | null }> {
  const local = loadStoredOrders(userId).map(normalizeOrder);

  if (!isSupabaseConfigured()) {
    return { orders: local, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { orders: local, error: null };
  }

  const { data, error } = await supabase
    .from('marketplace_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { orders: local, error: new Error(error.message) };
  }

  const remote = (data as MarketplaceOrderRow[]).map(mapRowToOrder);
  const merged = remote.length ? remote : local;
  saveStoredOrders(userId, merged);
  return { orders: merged, error: null };
}

export async function fetchMarketplaceOrderById(
  userId: string,
  orderId: string
): Promise<{ order: MarketplaceOrder | null; error: Error | null }> {
  const { orders, error } = await fetchMarketplaceOrdersByUserId(userId);
  if (error) {
    return { order: null, error };
  }
  return { order: orders.find((order) => order.id === orderId) ?? null, error: null };
}

export async function createMarketplaceOrder(
  userId: string,
  items: MarketplaceOrder['items'],
  subtotal: number,
  input: CreateMarketplaceOrderInput
): Promise<{ order: MarketplaceOrder | null; error: Error | null }> {
  if (items.length === 0) {
    return { order: null, error: new Error('El carrito está vacío') };
  }
  if (!input.deliveryAddress.trim()) {
    return { order: null, error: new Error('Ingresa una dirección de entrega') };
  }

  const now = new Date().toISOString();
  const order: MarketplaceOrder = normalizeOrder({
    id: ensureId('ord'),
    userId,
    items,
    subtotal,
    deliveryAddress: input.deliveryAddress.trim(),
    paymentMethodLabel: input.paymentMethodLabel,
    paymentMethodId: input.paymentMethodId ?? null,
    status: 'confirmed',
    trackingSteps: createInitialTrackingSteps(now),
    createdAt: now,
    updatedAt: now,
  });

  const existing = loadStoredOrders(userId);
  saveStoredOrders(userId, [order, ...existing]);

  if (!isSupabaseConfigured()) {
    return { order, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { order, error: null };
  }

  const { data, error } = await supabase
    .from('marketplace_orders')
    .insert({
      id: order.id,
      user_id: userId,
      items: order.items,
      subtotal: order.subtotal,
      delivery_address: order.deliveryAddress,
      payment_method_label: order.paymentMethodLabel,
      payment_method_id: order.paymentMethodId,
      status: order.status,
      tracking_steps: order.trackingSteps,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    })
    .select('*')
    .single();

  if (error) {
    return { order, error: null };
  }

  const persisted = mapRowToOrder(data as MarketplaceOrderRow);
  saveStoredOrders(userId, [persisted, ...existing.filter((item) => item.id !== order.id)]);
  return { order: persisted, error: null };
}
