import type { MarketplaceOrder, MarketplaceOrderStatus, MarketplaceTrackingStep } from '@/types';

export const TRACKING_STEP_ORDER: MarketplaceOrderStatus[] = [
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
];

const PROGRESSION_MINUTES = [0, 2, 5, 10];

export function createInitialTrackingSteps(completedAt: string): MarketplaceTrackingStep[] {
  return TRACKING_STEP_ORDER.map((status, index) => ({
    status,
    completedAt: index === 0 ? completedAt : null,
  }));
}

export function resolveLiveOrderStatus(order: MarketplaceOrder): {
  status: MarketplaceOrderStatus;
  steps: Array<MarketplaceTrackingStep & { active: boolean; completed: boolean }>;
} {
  const createdAt = new Date(order.createdAt).getTime();
  const elapsedMinutes = (Date.now() - createdAt) / 60000;

  let activeIndex = 0;
  for (let index = PROGRESSION_MINUTES.length - 1; index >= 0; index -= 1) {
    if (elapsedMinutes >= PROGRESSION_MINUTES[index]) {
      activeIndex = index;
      break;
    }
  }

  const status = TRACKING_STEP_ORDER[activeIndex] ?? 'confirmed';

  const steps = TRACKING_STEP_ORDER.map((stepStatus, index) => {
    const storedStep = order.trackingSteps?.find((step) => step.status === stepStatus);
    const completed = index <= activeIndex;
    return {
      status: stepStatus,
      completedAt: completed ? storedStep?.completedAt ?? order.createdAt : null,
      completed,
      active: index === activeIndex && status !== 'delivered',
    };
  });

  return { status, steps };
}

export type MarketplaceDisplayStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export function getOrderDisplayStatus(status: MarketplaceOrderStatus): MarketplaceDisplayStatus {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'delivered') return 'delivered';
  if (status === 'shipped') return 'shipped';
  return 'processing';
}

export function formatOrderDate(isoDate: string, locale = 'es-CO'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

export function formatOrderId(orderId: string): string {
  return orderId.replace(/-/g, '').slice(0, 8).toUpperCase();
}
