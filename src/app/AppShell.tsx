import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const { currentScreen, activeTab } = navigation;

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-background text-foreground overflow-hidden relative shadow-2xl">
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
