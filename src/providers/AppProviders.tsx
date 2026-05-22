import React, { type ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserDataProvider } from '@/contexts/UserDataContext';
import { PaymentMethodsProvider } from '@/contexts/PaymentMethodsContext';
import { RemindersProvider } from '@/contexts/RemindersContext';
import { ReservationsProvider } from '@/contexts/ReservationsContext';
import { ReminderAlertOverlay } from '@/app/components/reminders/ReminderAlertOverlay';

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
            <PaymentMethodsProvider>
              <RemindersProvider>
                <ReservationsProvider>
                  {children}
                  <ReminderAlertOverlay />
                </ReservationsProvider>
              </RemindersProvider>
            </PaymentMethodsProvider>
          </UserDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};
