import type { PaymentMethod } from '@/types';

const PREFIX = 'pawalk_payment_methods_';

function storageKey(userId: string): string {
  return `${PREFIX}${userId}`;
}

export function loadStoredPaymentMethods(userId: string): PaymentMethod[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as PaymentMethod[];
  } catch {
    return [];
  }
}

export function saveStoredPaymentMethods(userId: string, methods: PaymentMethod[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(methods));
}

export function clearStoredPaymentMethods(userId: string): void {
  localStorage.removeItem(storageKey(userId));
}
