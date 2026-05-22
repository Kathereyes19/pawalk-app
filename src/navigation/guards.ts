import {
  resolveAuthenticatedScreen,
  AUTH_ENTRY_SCREEN,
  type UserBundle,
} from '@/features/user';
import type { AppScreen } from './screens';

export {
  resolveAuthenticatedScreen,
  requiresAuth,
  isProtectedScreen,
  isAuthEntryScreen,
} from '@/features/user';

export function resolveInitialScreenForSession(options: {
  hasSession: boolean;
  bundle?: UserBundle | null;
}): AppScreen {
  if (!options.hasSession) {
    return AUTH_ENTRY_SCREEN;
  }
  if (options.bundle) {
    return resolveAuthenticatedScreen(options.bundle);
  }
  return AUTH_ENTRY_SCREEN;
}

export function isPublicScreen(screen: AppScreen): boolean {
  return ['login', 'signup'].includes(screen);
}
