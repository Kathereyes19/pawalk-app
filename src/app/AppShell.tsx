import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { AppProviders } from '@/providers/AppProviders';
import { getNavigationKey, getScreenTransition } from '@/navigation';
import { AppNavigator } from './navigation/AppNavigator';
import { useAppNavigation } from './navigation/useAppNavigation';

/**
 * Mobile-first shell: max-width frame, page transitions, bottom nav.
 * Preserves existing layout and motion behavior.
 */
function AppShellContent() {
  const navigation = useAppNavigation();
  const { currentScreen, activeTab, isAppReady, isNavigating } = navigation;
  const showBootstrapLoader = !isAppReady || isNavigating;

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-background text-foreground overflow-hidden relative shadow-2xl">
      {showBootstrapLoader && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-primary animate-spin" aria-label="Cargando" />
        </div>
      )}
      <div className="h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={getNavigationKey(currentScreen, activeTab)}
            {...getScreenTransition(currentScreen)}
            className="absolute inset-0"
          >
            <AppNavigator navigation={navigation} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <AppProviders>
      <AppShellContent />
    </AppProviders>
  );
}
