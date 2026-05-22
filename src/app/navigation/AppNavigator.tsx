import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from '../components/BottomNav';
import {
  BookingConfirmedScreen,
  BookingScreen,
  CheckoutScreen,
  HomeScreen,
  LiveTrackingScreen,
  LoginScreen,
  OnboardingCompletionScreen,
  OnboardingPetSetupScreen,
  PersonalProfileSetupScreen,
  PetProfileScreen,
  SignUpScreen,
  SplashScreen,
  WalkerProfileScreen,
  WelcomeScreen,
} from '../screens';
import { shouldShowBottomNav } from '@/navigation';
import type { useAppNavigation } from './useAppNavigation';

type NavigationReturn = ReturnType<typeof useAppNavigation>;

interface AppNavigatorProps {
  navigation: NavigationReturn;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ navigation }) => {
  const {
    currentScreen,
    activeTab,
    selectedWalker,
    bookingData,
    profileData,
    userPets,
    handlers,
  } = navigation;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            isReady={navigation.isAppReady}
            onComplete={handlers.handleSplashComplete}
          />
        );

      case 'welcome':
        return (
          <WelcomeScreen
            onComplete={handlers.handleWelcomeComplete}
            onLogin={handlers.handleWelcomeLogin}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onBack={() => handlers.goToScreen('welcome')}
            onLogin={handlers.handleLogin}
            onSignUp={() => handlers.goToScreen('signup')}
          />
        );

      case 'signup':
        return (
          <SignUpScreen
            onBack={() => handlers.goToScreen('welcome')}
            onSignUp={handlers.handleSignUp}
            onLogin={() => handlers.goToScreen('login')}
          />
        );

      case 'profile-setup':
        return (
          <PersonalProfileSetupScreen onComplete={handlers.handleProfileSetupComplete} />
        );

      case 'pet-setup':
        return (
          <OnboardingPetSetupScreen
            onComplete={handlers.handlePetSetupComplete}
            onSkip={() => {
              handlers.handlePetSetupComplete([]);
            }}
          />
        );

      case 'onboarding-complete':
        return (
          <OnboardingCompletionScreen
            profileData={profileData}
            petCount={userPets.length}
            onContinue={handlers.handleOnboardingComplete}
          />
        );

      case 'home':
        return <HomeScreen onWalkerClick={handlers.handleWalkerClick} />;

      case 'walker-profile':
        return (
          <WalkerProfileScreen
            walker={selectedWalker}
            onBack={handlers.handleBackHome}
            onBookWalk={handlers.handleBookWalk}
          />
        );

      case 'booking':
        return (
          <BookingScreen
            walker={selectedWalker}
            onBack={() => handlers.goToScreen('walker-profile')}
            onContinue={handlers.handleBookingContinue}
          />
        );

      case 'checkout':
        return (
          <CheckoutScreen
            walker={selectedWalker}
            bookingData={bookingData}
            onBack={() => handlers.goToScreen('booking')}
            onConfirm={handlers.handleCheckoutConfirm}
          />
        );

      case 'confirmed':
        return (
          <BookingConfirmedScreen
            walker={selectedWalker}
            bookingData={bookingData}
            onViewTracking={handlers.handleViewTracking}
            onBackHome={handlers.handleBackHome}
          />
        );

      case 'tracking':
        return (
          <LiveTrackingScreen walker={selectedWalker} onBack={handlers.handleBackHome} />
        );

      default:
        return <HomeScreen onWalkerClick={handlers.handleWalkerClick} />;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return null;

      case 'bookings':
        return (
          <div className="h-full flex items-center justify-center p-8 text-center overflow-hidden">
            <div className="pb-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">📅</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Mis Reservas</h2>
              <p className="text-muted-foreground">
                Tus paseos programados aparecerán aquí
              </p>
            </div>
          </div>
        );

      case 'pets':
        return <PetProfileScreen />;

      case 'profile':
        return (
          <div className="h-full flex items-center justify-center p-8 text-center overflow-hidden">
            <div className="pb-20">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-5xl">
                👤
              </div>
              <h2 className="text-2xl font-bold mb-2">Mi Perfil</h2>
              <p className="text-muted-foreground">Configuración de tu cuenta</p>
            </div>
          </div>
        );
    }
  };

  const showBottomNav = shouldShowBottomNav(currentScreen);

  return (
    <>
      {currentScreen === 'home' && activeTab !== 'home' ? renderTabContent() : renderScreen()}
      <AnimatePresence>
        {showBottomNav && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <BottomNav activeTab={activeTab} onTabChange={handlers.handleTabChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
