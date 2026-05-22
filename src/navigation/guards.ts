import type { AppScreen } from './screens';
import { AUTH_SCREENS, POST_AUTH_HOME } from './screens';

/**
 * Resolves the first screen after auth bootstrap.
 * Extend when profiles table exposes onboarding_completed.
 */
export function resolveInitialScreenForSession(options: {
  hasSession: boolean;
  onboardingCompleted?: boolean;
}): AppScreen {
  if (!options.hasSession) {
    return 'welcome';
  }
  if (options.onboardingCompleted === false) {
    return 'profile-setup';
  }
  return POST_AUTH_HOME;
}

export function isPublicScreen(screen: AppScreen): boolean {
  return AUTH_SCREENS.includes(screen);
}
