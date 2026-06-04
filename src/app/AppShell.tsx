import React from 'react';
import { AppProviders } from '@/providers/AppProviders';
import { LayoutProvider } from './components/layout/LayoutContext';
import { AppShellLayout } from './components/layout/AppShellLayout';
import { AppNavigator } from './navigation/AppNavigator';
import { useAppNavigation } from './navigation/useAppNavigation';

/**
 * Central SaaS shell: layout provider, role-based sidebar, responsive content frame.
 * Mobile consumer UX is unchanged below md breakpoint.
 */
function AppShellContent() {
  const navigation = useAppNavigation();
  const { isAppReady, isNavigating } = navigation;
  const showBootstrapLoader = !isAppReady || isNavigating;

  return (
    <AppShellLayout navigation={navigation} showBootstrapLoader={showBootstrapLoader}>
      <AppNavigator navigation={navigation} />
    </AppShellLayout>
  );
}

export default function AppShell() {
  return (
    <AppProviders>
      <LayoutProvider>
        <AppShellContent />
      </LayoutProvider>
    </AppProviders>
  );
}
