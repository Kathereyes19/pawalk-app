/**
 * Form field inventory per screen — use when wiring Supabase tables and validation.
 * UI components are unchanged; this documents the data contract.
 */

export const AUTH_FORMS = {
  login: {
    screen: 'LoginScreen',
    fields: ['email', 'password'] as const,
    supabase: 'auth.signInWithPassword',
  },
  signUp: {
    screen: 'SignUpScreen',
    fields: ['fullName', 'email', 'password', 'acceptTerms'] as const,
    supabase: 'auth.signUp + user_metadata.full_name',
  },
} as const;

export const ONBOARDING_FORMS = {
  personalProfile: {
    screen: 'PersonalProfileSetupScreen',
    steps: 3,
    fields: [
      'avatar',
      'fullName',
      'phone',
      'email',
      'neighborhood',
      'emergencyContact',
      'emergencyPhone',
      'language',
      'notifications.push',
      'notifications.email',
      'notifications.sms',
    ] as const,
    supabaseTable: 'profiles',
  },
  pets: {
    screen: 'OnboardingPetSetupScreen',
    fields: ['name', 'breed', 'age', 'weight', 'behaviors', 'gender', 'species', 'vaccinated'] as const,
    supabaseTable: 'pets',
  },
} as const;

export const BOOKING_FORMS = {
  booking: {
    screen: 'BookingScreen',
    fields: ['date', 'time', 'duration', 'petId', 'termsAccepted'] as const,
    supabaseTable: 'bookings',
  },
  checkout: {
    screen: 'CheckoutScreen',
    fields: ['paymentMethod'] as const,
    supabaseTable: 'payments',
  },
} as const;
