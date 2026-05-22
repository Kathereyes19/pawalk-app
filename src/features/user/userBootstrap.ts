import { fetchProfile } from '@/features/profile';
import { fetchPetsByUserId } from '@/features/pets';
import { hasPendingOnboarding } from '@/lib/onboardingSession';
import type { AppScreen } from '@/navigation';
import { POST_AUTH_HOME } from '@/navigation';
import type { Pet, UserProfile } from '@/types';

export interface UserBundle {
  profile: UserProfile | null;
  pets: Pet[];
  onboardingCompleted: boolean;
}

export async function loadUserBundle(userId: string): Promise<UserBundle> {
  const [profileResult, petsResult] = await Promise.all([
    fetchProfile(userId),
    fetchPetsByUserId(userId),
  ]);

  return {
    profile: profileResult.profile,
    pets: petsResult.pets,
    onboardingCompleted: profileResult.onboardingCompleted,
  };
}

/** Unauthenticated app entry */
export const AUTH_ENTRY_SCREEN: AppScreen = 'login';

/**
 * Returning users / completed onboarding — always home when flag is true.
 */
export function resolveAuthenticatedScreen(bundle: UserBundle): AppScreen {
  if (bundle.onboardingCompleted) {
    return POST_AUTH_HOME;
  }

  if (hasPendingOnboarding()) {
    return 'welcome';
  }

  if (bundle.profile?.fullName?.trim()) {
    if (bundle.pets.length === 0) {
      return 'pet-setup';
    }
    return 'onboarding-complete';
  }

  return 'profile-setup';
}

/** Immediately after registration (before intro slides). */
export function resolveAfterRegistration(): AppScreen {
  return 'welcome';
}

export const PROTECTED_SCREENS: AppScreen[] = [
  'home',
  'walker-profile',
  'booking',
  'checkout',
  'confirmed',
  'tracking',
  'notifications',
  'reminders',
];

export const ONBOARDING_FLOW_SCREENS: AppScreen[] = [
  'welcome',
  'profile-setup',
  'pet-setup',
  'onboarding-complete',
];

export function isProtectedScreen(screen: AppScreen): boolean {
  return PROTECTED_SCREENS.includes(screen);
}

export function requiresAuth(screen: AppScreen): boolean {
  return (
    isProtectedScreen(screen) ||
    ONBOARDING_FLOW_SCREENS.includes(screen)
  );
}

export function isAuthEntryScreen(screen: AppScreen): boolean {
  return screen === 'login' || screen === 'signup';
}
