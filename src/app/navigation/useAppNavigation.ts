import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { markOnboardingComplete, upsertProfile } from '@/features/profile';
import { replacePetsForUser } from '@/features/pets';
import { loadUserBundle, requiresAuth, resolvePostAuthScreen } from '@/features/user';
import {
  INITIAL_SCREEN,
  POST_AUTH_HOME,
  type AppScreen,
  type BottomNavTab,
} from '@/navigation';
import { resolveUserId } from '@/lib/mockUser';
import type { BookingData, Pet, UserProfile, Walker } from '@/types';

export function useAppNavigation() {
  const { session, isLoading: authLoading } = useAuth();
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
  const [isNewUser, setIsNewUser] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const isAppReady = !authLoading && (!resolveUserId(session?.user?.id ?? null) || !userDataLoading);
  const isAuthenticated = Boolean(session || userId);

  const navigateFromBundle = useCallback(
    async (uid: string) => {
      const bundle = await loadUserBundle(uid);
      setProfile(bundle.profile);
      setPets(bundle.pets);
      setOnboardingCompleted(bundle.onboardingCompleted);
      return resolvePostAuthScreen(bundle);
    },
    [setProfile, setPets, setOnboardingCompleted]
  );

  /** Route guard: block protected screens without auth */
  useEffect(() => {
    if (!isAppReady) return;
    if (!isAuthenticated && requiresAuth(currentScreen)) {
      setCurrentScreen('welcome');
    }
  }, [isAppReady, isAuthenticated, currentScreen]);

  /** Returning users with completed onboarding cannot re-enter onboarding screens */
  useEffect(() => {
    if (!isAppReady || !isAuthenticated || !onboardingCompleted) return;

    const onboardingOnly: AppScreen[] = ['profile-setup', 'pet-setup', 'onboarding-complete', 'welcome', 'login', 'signup'];
    if (onboardingOnly.includes(currentScreen)) {
      setCurrentScreen(POST_AUTH_HOME);
    }
  }, [isAppReady, isAuthenticated, onboardingCompleted, currentScreen]);

  const handleSplashComplete = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setCurrentScreen('welcome');
      return;
    }

    setIsNavigating(true);
    const screen = await navigateFromBundle(userId);
    setCurrentScreen(screen);
    setIsNavigating(false);
  }, [isAuthenticated, userId, navigateFromBundle]);

  const handleWelcomeComplete = useCallback(() => {
    setCurrentScreen('signup');
  }, []);

  const handleWelcomeLogin = useCallback(() => {
    setCurrentScreen('login');
  }, []);

  const handleLogin = useCallback(async () => {
    setIsNewUser(false);
    const uid = userId ?? resolveUserId(session?.user?.id ?? null);
    if (!uid) {
      setCurrentScreen(POST_AUTH_HOME);
      return;
    }

    setIsNavigating(true);
    await refreshUserData();
    const screen = await navigateFromBundle(uid);
    setCurrentScreen(screen);
    setIsNavigating(false);
  }, [userId, session?.user?.id, refreshUserData, navigateFromBundle]);

  const handleSignUp = useCallback(() => {
    setIsNewUser(true);
    setOnboardingCompleted(false);
    setCurrentScreen('profile-setup');
  }, [setOnboardingCompleted]);

  const handleProfileSetupComplete = useCallback(
    async (data: UserProfile) => {
      setProfile(data);
      const uid = userId ?? resolveUserId(session?.user?.id ?? null);
      if (uid) {
        await upsertProfile(uid, data);
      }
      setCurrentScreen('pet-setup');
    },
    [userId, session?.user?.id, setProfile]
  );

  const handlePetSetupComplete = useCallback(
    async (pets: Pet[]) => {
      const uid = userId ?? resolveUserId(session?.user?.id ?? null);
      if (uid) {
        const { pets: saved, error } = await replacePetsForUser(uid, pets);
        if (!error) {
          setPets(saved);
        } else {
          setPets(pets);
        }
      } else {
        setPets(pets);
      }
      setCurrentScreen('onboarding-complete');
    },
    [userId, session?.user?.id, setPets]
  );

  const handleOnboardingComplete = useCallback(async () => {
    const uid = userId ?? resolveUserId(session?.user?.id ?? null);
    if (uid) {
      await markOnboardingComplete(uid);
    }
    setOnboardingCompleted(true);
    setCurrentScreen(POST_AUTH_HOME);
  }, [userId, session?.user?.id, setOnboardingCompleted]);

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

  const handleTabChange = useCallback((tab: BottomNavTab) => {
    if (!isAuthenticated) {
      setCurrentScreen('welcome');
      return;
    }
    if (!onboardingCompleted && tab !== 'home') {
      setCurrentScreen(resolvePostAuthScreen({
        profile: profileData,
        pets: userPets,
        onboardingCompleted,
      }));
      return;
    }
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentScreen(POST_AUTH_HOME);
    }
  }, [isAuthenticated, onboardingCompleted, profileData, userPets]);

  const goToScreen = useCallback(
    (screen: AppScreen) => {
      if (!isAuthenticated && requiresAuth(screen)) {
        setCurrentScreen('welcome');
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
    isNewUser,
    isAppReady,
    isNavigating,
    isAuthenticated,
    onboardingCompleted,
    handlers: {
      handleSplashComplete,
      handleWelcomeComplete,
      handleWelcomeLogin,
      handleLogin,
      handleSignUp,
      handleProfileSetupComplete,
      handlePetSetupComplete,
      handleOnboardingComplete,
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
