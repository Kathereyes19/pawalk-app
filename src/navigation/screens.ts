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
  | 'walk-detail'
  | 'notifications'
  | 'reminders'
  | 'admin';

export type BottomNavTab = 'home' | 'bookings' | 'marketplace' | 'pets' | 'profile';

export type AdminTab = 'dashboard' | 'users' | 'reservations' | 'marketplace' | 'analytics';

export type AppLayoutMode = 'auth' | 'consumer' | 'admin';

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
  walkDetail: '/walks/:bookingId',
  notifications: '/notifications',
  reminders: '/reminders',
  admin: '/admin',
  bookingsTab: '/bookings',
  marketplaceTab: '/marketplace',
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
  'walk-detail',
];

export const ONBOARDING_SCREENS: AppScreen[] = [
  'profile-setup',
  'pet-setup',
  'onboarding-complete',
];

export const ADMIN_SCREENS: AppScreen[] = ['admin'];

export const SCREENS_WITHOUT_BOTTOM_NAV: AppScreen[] = [
  ...AUTH_SCREENS.filter((s) => s !== 'home'),
  ...BOOKING_FLOW_SCREENS,
  ...ADMIN_SCREENS,
];

export function shouldShowBottomNav(screen: AppScreen): boolean {
  return !SCREENS_WITHOUT_BOTTOM_NAV.includes(screen);
}

export function shouldShowAppSidebar(screen: AppScreen): boolean {
  return shouldShowBottomNav(screen) || screen === 'admin';
}

export function resolveLayoutMode(screen: AppScreen): AppLayoutMode {
  if (screen === 'admin') return 'admin';
  if (shouldShowBottomNav(screen)) return 'consumer';
  return 'auth';
}

export function shouldUseFullWidthLayout(screen: AppScreen): boolean {
  return (
    screen === 'admin' ||
    shouldShowBottomNav(screen) ||
    BOOKING_FLOW_SCREENS.includes(screen)
  );
}

/** First paint before auth bootstrap completes */
export const INITIAL_SCREEN: AppScreen = 'login';

export const AUTH_ENTRY_SCREEN: AppScreen = 'login';

export const POST_AUTH_HOME: AppScreen = 'home';
