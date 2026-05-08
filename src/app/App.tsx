import React, { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from './contexts/LanguageContext';
import { BottomNav } from './components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { PersonalProfileSetupScreen } from './screens/PersonalProfileSetupScreen';
import { OnboardingPetSetupScreen } from './screens/OnboardingPetSetupScreen';
import { OnboardingCompletionScreen } from './screens/OnboardingCompletionScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WalkerProfileScreen } from './screens/WalkerProfileScreen';
import { PetProfileScreen } from './screens/PetProfileScreen';
import { BookingScreen } from './screens/BookingScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { BookingConfirmedScreen } from './screens/BookingConfirmedScreen';
import { LiveTrackingScreen } from './screens/LiveTrackingScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';

type AppScreen =
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
  | 'tracking';

type BottomNavTab = 'home' | 'bookings' | 'pets' | 'profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [selectedWalker, setSelectedWalker] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [userPets, setUserPets] = useState<any[]>([]);

  const handleSplashComplete = () => {
    setCurrentScreen('welcome');
  };

  const handleWelcomeComplete = () => {
    setCurrentScreen('signup');
  };

  const handleWelcomeLogin = () => {
    setCurrentScreen('login');
  };

  const handleLogin = () => {
    // Returning user - skip onboarding
    setIsNewUser(false);
    setCurrentScreen('home');
  };

  const handleSignUp = () => {
    // New user - start onboarding flow
    setIsNewUser(true);
    setCurrentScreen('profile-setup');
  };

  const handleProfileSetupComplete = (data: any) => {
    setProfileData(data);
    setCurrentScreen('pet-setup');
  };

  const handlePetSetupComplete = (pets: any[]) => {
    setUserPets(pets);
    setCurrentScreen('onboarding-complete');
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('home');
  };

  const handleWalkerClick = (walker: any) => {
    setSelectedWalker(walker);
    setCurrentScreen('walker-profile');
  };

  const handleBookWalk = () => {
    setCurrentScreen('booking');
  };

  const handleBookingContinue = (data: any) => {
    setBookingData(data);
    setCurrentScreen('checkout');
  };

  const handleCheckoutConfirm = () => {
    setCurrentScreen('confirmed');
  };

  const handleViewTracking = () => {
    setCurrentScreen('tracking');
  };

  const handleBackHome = () => {
    setCurrentScreen('home');
    setActiveTab('home');
  };

  const handleTabChange = (tab: BottomNavTab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentScreen('home');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onComplete={handleSplashComplete} />;

      case 'welcome':
        return (
          <WelcomeScreen
            onComplete={handleWelcomeComplete}
            onLogin={handleWelcomeLogin}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onBack={() => setCurrentScreen('welcome')}
            onLogin={handleLogin}
            onSignUp={() => setCurrentScreen('signup')}
          />
        );

      case 'signup':
        return (
          <SignUpScreen
            onBack={() => setCurrentScreen('welcome')}
            onSignUp={handleSignUp}
            onLogin={() => setCurrentScreen('login')}
          />
        );

      case 'profile-setup':
        return (
          <PersonalProfileSetupScreen
            onComplete={handleProfileSetupComplete}
          />
        );

      case 'pet-setup':
        return (
          <OnboardingPetSetupScreen
            onComplete={handlePetSetupComplete}
            onSkip={() => {
              setUserPets([]);
              setCurrentScreen('onboarding-complete');
            }}
          />
        );

      case 'onboarding-complete':
        return (
          <OnboardingCompletionScreen
            profileData={profileData}
            petCount={userPets.length}
            onContinue={handleOnboardingComplete}
          />
        );

      case 'home':
        return <HomeScreen onWalkerClick={handleWalkerClick} />;

      case 'walker-profile':
        return (
          <WalkerProfileScreen
            walker={selectedWalker}
            onBack={handleBackHome}
            onBookWalk={handleBookWalk}
          />
        );

      case 'booking':
        return (
          <BookingScreen
            walker={selectedWalker}
            onBack={() => setCurrentScreen('walker-profile')}
            onContinue={handleBookingContinue}
          />
        );

      case 'checkout':
        return (
          <CheckoutScreen
            walker={selectedWalker}
            bookingData={bookingData}
            onBack={() => setCurrentScreen('booking')}
            onConfirm={handleCheckoutConfirm}
          />
        );

      case 'confirmed':
        return (
          <BookingConfirmedScreen
            walker={selectedWalker}
            bookingData={bookingData}
            onViewTracking={handleViewTracking}
            onBackHome={handleBackHome}
          />
        );

      case 'tracking':
        return (
          <LiveTrackingScreen
            walker={selectedWalker}
            onBack={handleBackHome}
          />
        );

      default:
        return <HomeScreen onWalkerClick={handleWalkerClick} />;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return null; // Handled by currentScreen

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
              <p className="text-muted-foreground">
                Configuración de tu cuenta
              </p>
            </div>
          </div>
        );
    }
  };

  const showBottomNav =
    currentScreen !== 'splash' &&
    currentScreen !== 'welcome' &&
    currentScreen !== 'login' &&
    currentScreen !== 'signup' &&
    currentScreen !== 'profile-setup' &&
    currentScreen !== 'pet-setup' &&
    currentScreen !== 'onboarding-complete' &&
    currentScreen !== 'walker-profile' &&
    currentScreen !== 'booking' &&
    currentScreen !== 'checkout' &&
    currentScreen !== 'confirmed' &&
    currentScreen !== 'tracking';

  // Get screen transition based on navigation type
  const getScreenTransition = (screen: AppScreen) => {
    if (screen === 'splash') return { initial: {}, animate: {}, exit: {} };

    // Onboarding flow - forward slide transitions
    if (['profile-setup', 'pet-setup', 'onboarding-complete'].includes(screen)) {
      return {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-50%', opacity: 0 },
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      };
    }

    // Booking flow (profile → booking → checkout → confirmed → tracking)
    if (['walker-profile', 'booking', 'checkout', 'confirmed', 'tracking'].includes(screen)) {
      return {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-50%', opacity: 0 },
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      };
    }

    // Default fade for main screens
    return {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
      transition: { duration: 0.25, ease: 'easeInOut' }
    };
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <LanguageProvider>
        <div className="w-full h-screen max-w-md mx-auto bg-background text-foreground overflow-hidden relative shadow-2xl">
          {/* Main Content with smooth transitions */}
          <div className="h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen === 'home' && activeTab !== 'home' ? activeTab : currentScreen}
                {...getScreenTransition(currentScreen)}
                className="absolute inset-0"
              >
                {currentScreen === 'home' && activeTab !== 'home'
                  ? renderTabContent()
                  : renderScreen()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation with smooth entry/exit */}
          <AnimatePresence>
            {showBottomNav && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}