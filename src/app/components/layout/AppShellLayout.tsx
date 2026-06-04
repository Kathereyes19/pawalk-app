import React, { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getNavigationKey,
  getScreenTransition,
  resolveLayoutMode,
  shouldShowAppSidebar,
  shouldUseFullWidthLayout,
} from '@/navigation';
import { SidebarNav } from './SidebarNav';
import { MainContentArea } from './MainContentArea';
import { RightPanelSlot } from './RightPanelSlot';
import type { useAppNavigation } from '../../navigation/useAppNavigation';

type NavigationReturn = ReturnType<typeof useAppNavigation>;

interface AppShellLayoutProps {
  navigation: NavigationReturn;
  showBootstrapLoader: boolean;
  children: ReactNode;
}

export const AppShellLayout: React.FC<AppShellLayoutProps> = ({
  navigation,
  showBootstrapLoader,
  children,
}) => {
  const {
    currentScreen,
    activeTab,
    activeAdminTab,
    isAdmin,
    handlers,
  } = navigation;

  const layoutMode = resolveLayoutMode(currentScreen);
  const showSidebar = shouldShowAppSidebar(currentScreen);
  const useFullWidth = shouldUseFullWidthLayout(currentScreen);

  return (
    <div className="h-screen w-full flex bg-muted/30 md:bg-background-secondary overflow-hidden">
      {showSidebar && (
        <SidebarNav
          layoutMode={layoutMode}
          activeTab={activeTab}
          activeAdminTab={activeAdminTab}
          isAdmin={isAdmin}
          onTabChange={handlers.handleTabChange}
          onAdminTabChange={handlers.handleAdminTabChange}
          onEnterAdmin={handlers.handleOpenAdmin}
          onExitAdmin={handlers.handleExitAdmin}
        />
      )}

      <div className="flex-1 flex min-w-0 h-full overflow-hidden">
        <MainContentArea layoutMode={layoutMode} useFullWidth={useFullWidth}>
          {showBootstrapLoader && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-primary animate-spin" aria-label="Cargando" />
            </div>
          )}
          <div className="h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={getNavigationKey(currentScreen, activeTab, activeAdminTab)}
                {...getScreenTransition(currentScreen)}
                className="absolute inset-0"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </MainContentArea>
        <RightPanelSlot />
      </div>
    </div>
  );
};
