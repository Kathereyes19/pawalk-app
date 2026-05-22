/**
 * Screen and tab identifiers for the in-app state machine.
 * Future: map these to react-router paths via ROUTE_PATHS.
 */

export type AppScreen =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'signup'
  | 'profile-setup'
  | 'pet-setup'
  | 'onboarding-complete'
  | 'home'
  | 'walker-profile'
  | 'booking'
  | 'checkout'
  | 'confirmed'
  | 'tracking'
  | 'notifications';

export type BottomNavTab = 'home' | 'bookings' | 'pets' | 'profile';

/** Planned URL paths when migrating to react-router */
export const ROUTE_PATHS = {
  splash: '/',
  welcome: '/welcome',
  login: '/login',
  signup: '/signup',
  profileSetup: '/onboarding/profile',
  petSetup: '/onboarding/pets',
  onboardingComplete: '/onboarding/complete',
  home: '/home',
  walkerProfile: '/walkers/:id',
  booking: '/book',
  checkout: '/checkout',
  confirmed: '/booking/confirmed',
  tracking: '/tracking/:bookingId',
  notifications: '/notifications',
  bookingsTab: '/bookings',
  petsTab: '/pets',
  profileTab: '/profile',
} as const;

export const AUTH_SCREENS: AppScreen[] = [
  'splash',
  'welcome',
  'login',
  'signup',
  'profile-setup',
  'pet-setup',
  'onboarding-complete',
];

export const BOOKING_FLOW_SCREENS: AppScreen[] = [
  'walker-profile',
  'booking',
  'checkout',
  'confirmed',
  'tracking',
];

export const ONBOARDING_SCREENS: AppScreen[] = [
  'profile-setup',
  'pet-setup',
  'onboarding-complete',
];

export const SCREENS_WITHOUT_BOTTOM_NAV: AppScreen[] = [
  ...AUTH_SCREENS.filter((s) => s !== 'home'),
  ...BOOKING_FLOW_SCREENS,
];

export function shouldShowBottomNav(screen: AppScreen): boolean {
  return !SCREENS_WITHOUT_BOTTOM_NAV.includes(screen);
}

/** First paint before auth bootstrap completes */
export const INITIAL_SCREEN: AppScreen = 'login';

export const AUTH_ENTRY_SCREEN: AppScreen = 'login';

export const POST_AUTH_HOME: AppScreen = 'home';
