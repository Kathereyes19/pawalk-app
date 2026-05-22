import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { markOnboardingComplete, upsertProfile } from '@/features/profile';
import { replacePetsForUser } from '@/features/pets';
import {
  AUTH_ENTRY_SCREEN,
  loadUserBundle,
  requiresAuth,
  resolveAuthenticatedScreen,
} from '@/features/user';
import { clearPendingOnboarding, setPendingOnboarding } from '@/lib/onboardingSession';
import { resolveUserId } from '@/lib/mockUser';
import {
  INITIAL_SCREEN,
  POST_AUTH_HOME,
  type AppScreen,
  type BottomNavTab,
} from '@/navigation';
import type { BookingData, Pet, UserProfile, Walker } from '@/types';

export function useAppNavigation() {
  const { session, isLoading: authLoading, signOut } = useAuth();
  const {
    userId,
    profile: profileData,
    pets: userPets,
    onboardingCompleted,
    isLoading: userDataLoading,
    setProfile,
    setPets,
    setOnboardingCompleted,
    refreshUserData,
  } = useUserData();

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(INITIAL_SCREEN);
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [selectedWalker, setSelectedWalker] = useState<Walker | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [welcomeMode, setWelcomeMode] = useState<'intro' | 'none'>('none');
  const hasBootstrapped = useRef(false);

  const resolvedUserId = userId ?? resolveUserId(session?.user?.id ?? null);
  const isAppReady =
    !authLoading && (!resolvedUserId || !userDataLoading);
  const isAuthenticated = Boolean(session || resolvedUserId);

  const applyBundleAndNavigate = useCallback(
    async (uid: string) => {
      const bundle = await loadUserBundle(uid);
      setProfile(bundle.profile);
      setPets(bundle.pets);
      setOnboardingCompleted(bundle.onboardingCompleted);
      setCurrentScreen(resolveAuthenticatedScreen(bundle));
      return bundle;
    },
    [setProfile, setPets, setOnboardingCompleted]
  );

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

  /** Route guard */
  useEffect(() => {
    if (!isAppReady) return;
    if (!isAuthenticated && requiresAuth(currentScreen)) {
      setCurrentScreen(AUTH_ENTRY_SCREEN);
    }
  }, [isAppReady, isAuthenticated, currentScreen]);

  /** Session restore: send completed users to home */
  useEffect(() => {
    if (!isAppReady || !resolvedUserId || userDataLoading) return;
    if (onboardingCompleted && ['login', 'signup'].includes(currentScreen)) {
      setCurrentScreen(POST_AUTH_HOME);
    }
  }, [
    isAppReady,
    resolvedUserId,
    userDataLoading,
    onboardingCompleted,
    currentScreen,
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

  const handleLogin = useCallback(async () => {
    clearPendingOnboarding();
    const uid = resolvedUserId;
    if (!uid) {
      setCurrentScreen(AUTH_ENTRY_SCREEN);
      return;
    }

    setIsNavigating(true);
    await refreshUserData();
    const bundle = await loadUserBundle(uid);
    setProfile(bundle.profile);
    setPets(bundle.pets);
    setOnboardingCompleted(bundle.onboardingCompleted);

    if (bundle.onboardingCompleted) {
      setCurrentScreen(POST_AUTH_HOME);
    } else {
      setCurrentScreen(resolveAuthenticatedScreen(bundle));
    }
    setIsNavigating(false);
  }, [resolvedUserId, refreshUserData, setProfile, setPets, setOnboardingCompleted]);

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
    setProfile(null);
    setPets([]);
    setOnboardingCompleted(false);
    setActiveTab('home');
    hasBootstrapped.current = true;
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

  const handleCheckoutConfirm = useCallback(() => {
    setCurrentScreen('confirmed');
  }, []);

  const handleViewTracking = useCallback(() => {
    setCurrentScreen('tracking');
  }, []);

  const handleBackHome = useCallback(() => {
    setCurrentScreen(POST_AUTH_HOME);
    setActiveTab('home');
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

  const goToScreen = useCallback(
    (screen: AppScreen) => {
      if (!isAuthenticated && requiresAuth(screen)) {
        setCurrentScreen(AUTH_ENTRY_SCREEN);
        return;
      }
      setCurrentScreen(screen);
    },
    [isAuthenticated]
  );

  return {
    currentScreen,
    activeTab,
    selectedWalker,
    bookingData,
    profileData,
    userPets,
    isAppReady,
    isNavigating,
    isAuthenticated,
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
      handleViewTracking,
      handleBackHome,
      handleTabChange,
      goToScreen,
    },
  };
}
