import React, { type ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserDataProvider } from '@/contexts/UserDataContext';
import { ReservationsProvider } from '@/contexts/ReservationsContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Global providers for the mobile shell.
 * Order: theme → i18n → auth (Supabase session).
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <LanguageProvider>
        <AuthProvider>
          <UserDataProvider>
            <ReservationsProvider>{children}</ReservationsProvider>
          </UserDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};
