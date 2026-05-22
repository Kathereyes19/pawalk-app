import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  INITIAL_SCREEN,
  POST_AUTH_HOME,
  resolveInitialScreenForSession,
  type AppScreen,
  type BottomNavTab,
} from '@/navigation';
import { markOnboardingComplete, upsertProfile } from '@/features/profile';
import { syncPetsForUser } from '@/features/pets';
import type { BookingData, Pet, UserProfile, Walker } from '@/types';

export interface AppNavigationState {
  currentScreen: AppScreen;
  activeTab: BottomNavTab;
  selectedWalker: Walker | null;
  bookingData: BookingData | null;
  profileData: UserProfile | null;
  userPets: Pet[];
  isNewUser: boolean;
}

export function useAppNavigation() {
  const { user, session, isLoading: authLoading } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(INITIAL_SCREEN);
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [selectedWalker, setSelectedWalker] = useState<Walker | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [userPets, setUserPets] = useState<Pet[]>([]);

  /** Restore session for returning users (after Supabase bootstrap). */
  useEffect(() => {
    if (authLoading || !session) return;

    const restorable: AppScreen[] = ['welcome', 'login', 'signup'];
    if (restorable.includes(currentScreen)) {
      setCurrentScreen(
        resolveInitialScreenForSession({ hasSession: true, onboardingCompleted: true })
      );
    }
  }, [session, authLoading, currentScreen]);

  const handleSplashComplete = useCallback(() => {
    setCurrentScreen(session ? POST_AUTH_HOME : 'welcome');
  }, [session]);

  const handleWelcomeComplete = useCallback(() => {
    setCurrentScreen('signup');
  }, []);

  const handleWelcomeLogin = useCallback(() => {
    setCurrentScreen('login');
  }, []);

  const handleLogin = useCallback(() => {
    setIsNewUser(false);
    setCurrentScreen(POST_AUTH_HOME);
  }, []);

  const handleSignUp = useCallback(() => {
    setIsNewUser(true);
    setCurrentScreen('profile-setup');
  }, []);

  const handleProfileSetupComplete = useCallback(
    async (data: UserProfile) => {
      setProfileData(data);
      if (user?.id) {
        await upsertProfile(user.id, data);
      }
      setCurrentScreen('pet-setup');
    },
    [user?.id]
  );

  const handlePetSetupComplete = useCallback(
    async (pets: Pet[]) => {
      setUserPets(pets);
      if (user?.id) {
        await syncPetsForUser(user.id, pets);
      }
      setCurrentScreen('onboarding-complete');
    },
    [user?.id]
  );

  const handleOnboardingComplete = useCallback(async () => {
    if (user?.id) {
      await markOnboardingComplete(user.id);
    }
    setCurrentScreen(POST_AUTH_HOME);
  }, [user?.id]);

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
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentScreen(POST_AUTH_HOME);
    }
  }, []);

  const goToScreen = useCallback((screen: AppScreen) => {
    setCurrentScreen(screen);
  }, []);

  return {
    currentScreen,
    activeTab,
    selectedWalker,
    bookingData,
    profileData,
    userPets,
    isNewUser,
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
