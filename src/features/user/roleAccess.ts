import type { UserProfile } from '@/types';
import { DEFAULT_USER_ROLE, isAdminRole, type UserRole } from '@/types/role';
import type { AppScreen } from '@/navigation';

const ADMIN_EMAILS = new Set(['admin@pawalk.app', 'admin@pawalk.com']);

export function resolveUserRole(
  profile: UserProfile | null | undefined,
  email?: string | null
): UserRole {
  if (profile?.role === 'admin') return 'admin';

  const normalized = (email ?? profile?.email ?? '').trim().toLowerCase();
  if (ADMIN_EMAILS.has(normalized) || normalized.endsWith('@pawalk.admin')) {
    return 'admin';
  }

  return profile?.role ?? DEFAULT_USER_ROLE;
}

export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  return isAdminRole(role);
}

export const ADMIN_SCREENS: AppScreen[] = ['admin'];

export function isAdminScreen(screen: AppScreen): boolean {
  return ADMIN_SCREENS.includes(screen);
}

export function requiresAdmin(screen: AppScreen): boolean {
  return isAdminScreen(screen);
}
