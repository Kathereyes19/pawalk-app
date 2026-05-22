# Pawalk — Architecture & Supabase readiness

## Mobile-first shell

The app is a **single-page prototype** framed as a phone viewport:

- `max-w-md mx-auto h-screen` in `AppShell.tsx`
- Safe-area utilities in `theme.css` (`.pb-safe`, `.pt-safe`)
- Touch-oriented components (`touch-manipulation`, full-width CTAs)

No UI redesign was applied during Supabase preparation.

## Folder layout

```
src/
├── app/                    # UI layer (unchanged screen components)
│   ├── App.tsx             # Re-exports AppShell
│   ├── AppShell.tsx        # Mobile frame + transitions
│   ├── navigation/         # useAppNavigation + AppNavigator
│   ├── screens/            # Full-page views (+ index barrel)
│   ├── components/         # Pawalk design system (+ index barrel)
│   ├── contexts/           # LanguageContext
│   └── forms/registry.ts   # Form → Supabase field mapping
├── config/env.ts           # VITE_* accessors
├── contexts/AuthContext.tsx
├── features/
│   ├── auth/               # signIn, signUp, validation
│   ├── profile/            # profiles table helpers
│   └── pets/               # pets table helpers
├── lib/supabase/           # Lazy Supabase client
├── navigation/             # Screen IDs, transitions, route path map
├── providers/AppProviders.tsx
└── types/                  # Shared domain types
```

## Routing (current)

Navigation is a **state machine** (`AppScreen` + `BottomNavTab`), not URL routes.

- Constants: `src/navigation/screens.ts`
- Future paths: `ROUTE_PATHS` (for `react-router` migration)
- Logic: `useAppNavigation` + `AppNavigator`

`react-router` remains a dependency but is not active yet.

## Screens & forms

| Screen | Form fields | Supabase target |
|--------|-------------|-----------------|
| LoginScreen | email, password | `auth.signInWithPassword` |
| SignUpScreen | name, email, password, terms | `auth.signUp` |
| PersonalProfileSetupScreen | profile fields (3 steps) | `profiles` |
| OnboardingPetSetupScreen | pet fields | `pets` |
| BookingScreen / CheckoutScreen | date, time, payment | `bookings` / `payments` (TBD) |

See `src/app/forms/registry.ts` for the full inventory.

## Reusable UI components

Active design system (used by screens): `Button`, `Input`, `Card`, `Badge`, `Avatar`, `IconButton`, `SearchBar`, `Divider`, `BottomNav`.

Exported from `src/app/components/index.ts`.

The `components/ui/` shadcn kit is **not wired** to screens; keep for future admin/desktop surfaces or remove later.

## Authentication

1. Copy `.env.example` → `.env` and set Supabase URL + anon key.
2. `AuthProvider` listens for session changes (`src/contexts/AuthContext.tsx`).
3. `LoginScreen` / `SignUpScreen` call `features/auth` — **mock delays preserved** when env is unset.
4. Onboarding completion calls `upsertProfile`, `syncPetsForUser`, `markOnboardingComplete` when a user id exists.

Run `supabase/schema.sql` in your Supabase project before enabling profile/pet sync.

## Next integration steps

1. Confirm email settings in Supabase Auth (or disable confirmation for MVP).
2. Generate TypeScript types: `supabase gen types typescript`.
3. Migrate navigation to `react-router` using `ROUTE_PATHS`.
4. Wire `NotificationsScreen` and bookings/profile tabs.
5. Replace mock walkers/bookings with Supabase queries + RLS.
