import { resolvePostAuthScreen, type UserBundle } from '@/features/user';
import type { AppScreen } from './screens';
import { POST_AUTH_HOME } from './screens';

export { resolvePostAuthScreen, requiresAuth, isProtectedScreen } from '@/features/user';

/**
 * Resolves the first screen after auth bootstrap (splash / session restore).
 */
export function resolveInitialScreenForSession(options: {
  hasSession: boolean;
  bundle?: UserBundle | null;
}): AppScreen {
  if (!options.hasSession) {
    return 'welcome';
  }
  if (options.bundle) {
    return resolvePostAuthScreen(options.bundle);
  }
  return POST_AUTH_HOME;
}

export function isPublicScreen(screen: AppScreen): boolean {
  return ['splash', 'welcome', 'login', 'signup'].includes(screen);
}
