import type { Reservation } from '@/types';

const PREFIX = 'pawalk_reservations_';

function storageKey(userId: string): string {
  return `${PREFIX}${userId}`;
}

export function loadStoredReservations(userId: string): Reservation[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as Reservation[];
  } catch {
    return [];
  }
}

export function saveStoredReservations(userId: string, reservations: Reservation[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(reservations));
}

export function clearStoredReservations(userId: string): void {
  localStorage.removeItem(storageKey(userId));
}
