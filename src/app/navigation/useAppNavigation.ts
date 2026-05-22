import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { useReservations } from '@/contexts/ReservationsContext';
import { markOnboardingComplete, upsertProfile } from '@/features/profile';
import { replacePetsForUser } from '@/features/pets';
import { reservationToWalker, resolveEffectiveStatus } from '@/features/reservations';
import { getReservationCategory } from '@/lib/providers/reservationCategory';
import { supportsLiveTracking } from '@/lib/providers/serviceExperience';
import {
  AUTH_ENTRY_SCREEN,
  isAuthEntryScreen,
  loadUserBundle,
  requiresAuth,
  resolveAuthenticatedScreen,
} from '@/features/user';
import { waitForAuthSession } from '@/features/auth';
import { clearPendingOnboarding, setPendingOnboarding } from '@/lib/onboardingSession';
import { getMockUserId, resolveUserId } from '@/lib/mockUser';
import {
  INITIAL_SCREEN,
  POST_AUTH_HOME,
  type AdminTab,
  type AppScreen,
  type BottomNavTab,
} from '@/navigation';
import type { BookingData, CheckoutPaymentSelection, Pet, Reservation, UserProfile, Walker } from '@/types';

export function useAppNavigation() {
  const { session, isLoading: authLoading, signOut } = useAuth();
  const {
    userId,
    profile: profileData,
    pets: userPets,
    onboardingCompleted,
    isAdmin,
    isLoading: userDataLoading,
    setProfile,
    setPets,
    setOnboardingCompleted,
    refreshUserData,
  } = useUserData();
  const { bookReservation, completeReservationWalk } = useReservations();

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(INITIAL_SCREEN);
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [selectedWalker, setSelectedWalker] = useState<Walker | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [walkDetailReservation, setWalkDetailReservation] = useState<Reservation | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [welcomeMode, setWelcomeMode] = useState<'intro' | 'none'>('none');
  /** Set immediately on login so guards see auth before Supabase session propagates */
  const [confirmedUserId, setConfirmedUserId] = useState<string | null>(() => getMockUserId());
  const hasBootstrapped = useRef(false);

  const resolvedUserId =
    userId ?? confirmedUserId ?? resolveUserId(session?.user?.id ?? null);
  const isAppReady =
    !authLoading && (!resolvedUserId || !userDataLoading);
  const isAuthenticated = Boolean(resolvedUserId || session);

  const applyBundleAndNavigate = useCallback(
    async (uid: string) => {
      const bundle = await loadUserBundle(uid);
      setProfile(bundle.profile);
      setPets(bundle.pets);
      setOnboardingCompleted(bundle.onboardingCompleted);

      const destination = bundle.onboardingCompleted
        ? POST_AUTH_HOME
        : resolveAuthenticatedScreen(bundle);
      setCurrentScreen(destination);
      return bundle;
    },
    [setProfile, setPets, setOnboardingCompleted]
  );

  /** Keep confirmed user id in sync when Supabase session restores */
  useEffect(() => {
    const uid = resolveUserId(session?.user?.id ?? null);
    if (uid) {
      setConfirmedUserId(uid);
    }
  }, [session?.user?.id]);

  /** One-time routing after auth + user data are ready */
  useEffect(() => {
    if (!isAppReady || hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    if (!isAuthenticated || !resolvedUserId) {
      setCurrentScreen(AUTH_ENTRY_SCREEN);
      return;
    }

    void applyBundleAndNavigate(resolvedUserId);
  }, [isAppReady, isAuthenticated, resolvedUserId, applyBundleAndNavigate]);

  /** Route guard — skip while post-login navigation is in flight */
  useEffect(() => {
    if (!isAppReady || isNavigating) return;
    if (!isAuthenticated && requiresAuth(currentScreen)) {
      setCurrentScreen(AUTH_ENTRY_SCREEN);
    }
  }, [isAppReady, isNavigating, isAuthenticated, currentScreen]);

  /** Block non-admin users from admin routes */
  useEffect(() => {
    if (!isAppReady || currentScreen !== 'admin') return;
    if (!isAdmin) {
      setCurrentScreen(POST_AUTH_HOME);
      setActiveTab('home');
    }
  }, [isAppReady, currentScreen, isAdmin]);

  /** Session restore: send completed users to home */
  useEffect(() => {
    if (!isAppReady || !resolvedUserId || userDataLoading) return;
    if (onboardingCompleted && isAuthEntryScreen(currentScreen)) {
      setCurrentScreen(POST_AUTH_HOME);
      setActiveTab('home');
    }
  }, [
    isAppReady,
    resolvedUserId,
    userDataLoading,
    onboardingCompleted,
    currentScreen,
  ]);

  /** Redirect when Supabase session becomes available on auth screens */
  useEffect(() => {
    if (!isAppReady || isNavigating) return;
    if (!session?.user?.id) return;
    if (!isAuthEntryScreen(currentScreen)) return;

    const uid = resolveUserId(session.user.id);
    if (!uid) return;

    hasBootstrapped.current = true;
    setWelcomeMode('none');
    setConfirmedUserId(uid);

    void (async () => {
      setIsNavigating(true);
      try {
        await applyBundleAndNavigate(uid);
        setActiveTab('home');
      } finally {
        setIsNavigating(false);
      }
    })();
  }, [
    isAppReady,
    isNavigating,
    session?.user?.id,
    currentScreen,
    applyBundleAndNavigate,
  ]);

  /** Completed users must not see auth/onboarding again */
  useEffect(() => {
    if (!isAppReady || !isAuthenticated || !onboardingCompleted) return;

    const blocked: AppScreen[] = [
      'welcome',
      'login',
      'signup',
      'profile-setup',
      'pet-setup',
      'onboarding-complete',
    ];
    if (blocked.includes(currentScreen)) {
      setCurrentScreen(POST_AUTH_HOME);
      setWelcomeMode('none');
    }
  }, [isAppReady, isAuthenticated, onboardingCompleted, currentScreen]);

  const handleWelcomeComplete = useCallback(() => {
    setWelcomeMode('none');
    setCurrentScreen('profile-setup');
  }, []);

  const handleWelcomeLogin = useCallback(() => {
    setCurrentScreen('login');
  }, []);

  const handleLogin = useCallback(
    async (loginUserId?: string | null) => {
      clearPendingOnboarding();
      setWelcomeMode('none');
      hasBootstrapped.current = true;

      let uid = resolveUserId(loginUserId ?? session?.user?.id ?? confirmedUserId);
      if (!uid) {
        const sessionUserId = await waitForAuthSession();
        uid = resolveUserId(sessionUserId);
      }

      if (!uid) {
        setCurrentScreen(AUTH_ENTRY_SCREEN);
        return;
      }

      setConfirmedUserId(uid);
      setIsNavigating(true);
      try {
        await applyBundleAndNavigate(uid);
        setActiveTab('home');
      } finally {
        setIsNavigating(false);
      }
    },
    [session?.user?.id, confirmedUserId, applyBundleAndNavigate]
  );

  const handleSignUp = useCallback(() => {
    setPendingOnboarding(true);
    setWelcomeMode('intro');
    setOnboardingCompleted(false);
    setCurrentScreen('welcome');
  }, [setOnboardingCompleted]);

  const handleProfileSetupComplete = useCallback(
    async (data: UserProfile) => {
      setProfile(data);
      const uid = resolvedUserId;
      if (uid) {
        await upsertProfile(uid, data);
      }
      setCurrentScreen('pet-setup');
    },
    [resolvedUserId, setProfile]
  );

  const handlePetSetupComplete = useCallback(
    async (pets: Pet[]) => {
      const uid = resolvedUserId;
      if (uid) {
        const { pets: saved, error } = await replacePetsForUser(uid, pets);
        setPets(error ? pets : saved);
      } else {
        setPets(pets);
      }
      setCurrentScreen('onboarding-complete');
    },
    [resolvedUserId, setPets]
  );

  const handleOnboardingComplete = useCallback(async () => {
    const uid = resolvedUserId;
    if (uid) {
      await markOnboardingComplete(uid, profileData ?? undefined);
      await refreshUserData();
    }
    clearPendingOnboarding();
    setWelcomeMode('none');
    setOnboardingCompleted(true);
    setCurrentScreen(POST_AUTH_HOME);
  }, [resolvedUserId, profileData, setOnboardingCompleted, refreshUserData]);

  const handleLogout = useCallback(async () => {
    await signOut();
    clearPendingOnboarding();
    setWelcomeMode('none');
    setConfirmedUserId(null);
    setProfile(null);
    setPets([]);
    setOnboardingCompleted(false);
    setActiveTab('home');
    setActiveAdminTab('dashboard');
    setActiveReservation(null);
    setBookingData(null);
    setSelectedWalker(null);
    hasBootstrapped.current = false;
    setCurrentScreen(AUTH_ENTRY_SCREEN);
  }, [signOut, setProfile, setPets, setOnboardingCompleted]);

  const handleWalkerClick = useCallback((walker: Walker) => {
    setSelectedWalker(walker);
    setCurrentScreen('walker-profile');
  }, []);

  const handleBookWalk = useCallback(() => {
    setCurrentScreen('booking');
  }, []);

  const handleBookingContinue = useCallback((data: BookingData) => {
    setBookingData(data);
    setCurrentScreen('checkout');
  }, []);

  const handleCheckoutConfirm = useCallback(
    async (selection: CheckoutPaymentSelection): Promise<{ error: string | null }> => {
      setIsNavigating(true);
      try {
        if (!selectedWalker || !bookingData) {
          return { error: 'Faltan datos de la reserva. Vuelve atrás e intenta de nuevo.' };
        }
        if (!resolvedUserId) {
          return { error: 'Inicia sesión para confirmar la reserva.' };
        }

        const { error } = await bookReservation({
          walker: selectedWalker,
          bookingData,
          pets: bookingData.pets,
          petId: bookingData.pets?.[0]?.id ?? null,
          petName: bookingData.pets?.map((pet) => pet.name).join(', ') ?? 'Mascota',
          paymentMethod: selection.paymentLabel,
          paymentMethodId: selection.paymentMethodId,
        });

        if (error) {
          return { error };
        }

        setCurrentScreen('confirmed');
        return { error: null };
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : 'Ocurrió un error al confirmar la reserva.',
        };
      } finally {
        setIsNavigating(false);
      }
    },
    [selectedWalker, bookingData, resolvedUserId, bookReservation]
  );

  const handleViewWalkDetail = useCallback((reservation: Reservation) => {
    setWalkDetailReservation(reservation);
    setCurrentScreen('walk-detail');
  }, []);

  const handleBackFromWalkDetail = useCallback(() => {
    setWalkDetailReservation(null);
    setCurrentScreen(POST_AUTH_HOME);
    setActiveTab('bookings');
  }, []);

  const handleOpenReminders = useCallback(() => {
    setCurrentScreen('reminders');
  }, []);

  const handleBackFromReminders = useCallback(() => {
    setCurrentScreen(POST_AUTH_HOME);
  }, []);

  const handleViewReservations = useCallback(() => {
    setActiveTab('bookings');
    setCurrentScreen(POST_AUTH_HOME);
    setBookingData(null);
    setSelectedWalker(null);
  }, []);

  const handleViewTracking = useCallback(
    (reservation: Reservation) => {
      const effective = resolveEffectiveStatus(reservation);
      if (effective !== 'active') return;
      if (!supportsLiveTracking(getReservationCategory(reservation))) return;

      setSelectedWalker(reservationToWalker(reservation));
      setActiveReservation(reservation);
      setCurrentScreen('tracking');
    },
    []
  );

  const handleWalkComplete = useCallback(
    async (reservationId: string, summary?: { distanceKm?: number; durationMinutes?: number }) => {
      await completeReservationWalk(reservationId, summary);
      setActiveReservation(null);
      setActiveTab('bookings');
      setCurrentScreen(POST_AUTH_HOME);
    },
    [completeReservationWalk]
  );

  const handleBackFromTracking = useCallback(() => {
    setCurrentScreen(POST_AUTH_HOME);
    setActiveTab('bookings');
  }, []);

  const handleBackHome = useCallback(() => {
    setCurrentScreen(POST_AUTH_HOME);
    setActiveTab('home');
    setActiveReservation(null);
    setBookingData(null);
    setSelectedWalker(null);
  }, []);

  const handleTabChange = useCallback(
    (tab: BottomNavTab) => {
      if (!isAuthenticated) {
        setCurrentScreen(AUTH_ENTRY_SCREEN);
        return;
      }
      if (!onboardingCompleted) {
        setCurrentScreen(
          resolveAuthenticatedScreen({
            profile: profileData,
            pets: userPets,
            onboardingCompleted,
          })
        );
        return;
      }
      setActiveTab(tab);
      if (tab === 'home') {
        setCurrentScreen(POST_AUTH_HOME);
      }
    },
    [isAuthenticated, onboardingCompleted, profileData, userPets]
  );

  const handleOpenAdmin = useCallback(() => {
    if (!isAdmin) return;
    setCurrentScreen('admin');
    setActiveAdminTab('dashboard');
  }, [isAdmin]);

  const handleExitAdmin = useCallback(() => {
    setCurrentScreen(POST_AUTH_HOME);
    setActiveTab('home');
  }, []);

  const handleAdminTabChange = useCallback(
    (tab: AdminTab) => {
      if (!isAdmin) return;
      setActiveAdminTab(tab);
      setCurrentScreen('admin');
    },
    [isAdmin]
  );

  const goToScreen = useCallback(
    (screen: AppScreen) => {
      if (!isAuthenticated && requiresAuth(screen)) {
        setCurrentScreen(AUTH_ENTRY_SCREEN);
        return;
      }
      if (screen === 'admin' && !isAdmin) {
        setCurrentScreen(POST_AUTH_HOME);
        return;
      }
      setCurrentScreen(screen);
    },
    [isAuthenticated, isAdmin]
  );

  return {
    currentScreen,
    activeTab,
    activeAdminTab,
    selectedWalker,
    bookingData,
    activeReservation,
    walkDetailReservation,
    profileData,
    userPets,
    isAppReady,
    isNavigating,
    isAuthenticated,
    isAdmin,
    onboardingCompleted,
    welcomeMode,
    handlers: {
      handleWelcomeComplete,
      handleWelcomeLogin,
      handleLogin,
      handleSignUp,
      handleProfileSetupComplete,
      handlePetSetupComplete,
      handleOnboardingComplete,
      handleLogout,
      handleWalkerClick,
      handleBookWalk,
      handleBookingContinue,
      handleCheckoutConfirm,
      handleViewReservations,
      handleViewTracking,
      handleViewWalkDetail,
      handleBackFromWalkDetail,
      handleOpenReminders,
      handleBackFromReminders,
      handleWalkComplete,
      handleBackFromTracking,
      handleBackHome,
      handleTabChange,
      handleOpenAdmin,
      handleExitAdmin,
      handleAdminTabChange,
      goToScreen,
    },
  };
}
