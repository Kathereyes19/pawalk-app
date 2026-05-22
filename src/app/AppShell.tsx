import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { AppProviders } from '@/providers/AppProviders';
import { getNavigationKey, getScreenTransition, shouldShowBottomNav } from '@/navigation';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { AppNavigator } from './navigation/AppNavigator';
import { useAppNavigation } from './navigation/useAppNavigation';

/**
 * Responsive shell: mobile-first frame with optional desktop sidebar.
 * Mobile layout (max-w-md, bottom nav) is unchanged below md breakpoint.
 */
function AppShellContent() {
  const navigation = useAppNavigation();
  const { currentScreen, activeTab, isAppReady, isNavigating, handlers } = navigation;
  const showBootstrapLoader = !isAppReady || isNavigating;
  const showSidebar = shouldShowBottomNav(currentScreen);

  return (
    <div className="h-screen w-full flex bg-muted/30 md:bg-background-secondary overflow-hidden">
      {showSidebar && (
        <DesktopSidebar activeTab={activeTab} onTabChange={handlers.handleTabChange} />
      )}

      <div className="flex-1 flex justify-center min-w-0 h-full overflow-hidden">
        <div className="w-full h-full max-w-md mx-auto bg-background text-foreground overflow-hidden relative shadow-2xl md:max-w-none md:mx-0 md:shadow-none">
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
