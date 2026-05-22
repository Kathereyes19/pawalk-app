import type { Pet, UserProfile } from '@/types';

const PREFIX = 'pawalk_user_';

export interface StoredUserBundle {
  onboardingCompleted: boolean;
  profile: UserProfile | null;
  pets: Pet[];
}

function storageKey(userId: string): string {
  return `${PREFIX}${userId}`;
}

export function loadStoredUserBundle(userId: string): StoredUserBundle | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredUserBundle;
  } catch {
    return null;
  }
}

export function saveStoredUserBundle(userId: string, bundle: StoredUserBundle): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(bundle));
}

export function clearStoredUserBundle(userId: string): void {
  localStorage.removeItem(storageKey(userId));
}
