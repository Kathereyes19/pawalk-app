import { fetchProfile } from '@/features/profile';
import { fetchPetsByUserId } from '@/features/pets';
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

/**
 * Where to send the user after login, cold start, or splash (when authenticated).
 */
export function resolvePostAuthScreen(bundle: UserBundle): AppScreen {
  if (bundle.onboardingCompleted) {
    return POST_AUTH_HOME;
  }

  if (!bundle.profile?.fullName) {
    return 'profile-setup';
  }

  if (bundle.pets.length === 0) {
    return 'pet-setup';
  }

  return 'onboarding-complete';
}

export const PROTECTED_SCREENS: AppScreen[] = [
  'home',
  'walker-profile',
  'booking',
  'checkout',
  'confirmed',
  'tracking',
  'notifications',
];

export function isProtectedScreen(screen: AppScreen): boolean {
  return PROTECTED_SCREENS.includes(screen);
}

export function requiresAuth(screen: AppScreen): boolean {
  return isProtectedScreen(screen) || screen === 'profile-setup' || screen === 'pet-setup' || screen === 'onboarding-complete';
}
