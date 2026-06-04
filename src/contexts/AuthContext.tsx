import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import { signOut as authSignOut } from '@/features/auth';
import { logAuthDebug } from '@/lib/authDebug';
import { getMockUserId, resolveAuthUserId } from '@/lib/mockUser';

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  /** Stable user id for data + booking (session, login handshake, or mock storage). */
  resolvedUserId: string | null;
  isLoading: boolean;
  isConfigured: boolean;
  /** Call right after login so booking works before Supabase session propagates. */
  confirmAuthenticatedUser: (userId: string | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured());
  const [confirmedUserId, setConfirmedUserId] = useState<string | null>(() => getMockUserId());

  const isConfigured = isSupabaseConfigured();
  const sessionUserId = session?.user?.id ?? null;
  const resolvedUserId = resolveAuthUserId(sessionUserId, confirmedUserId);

  useEffect(() => {
    logAuthDebug('AuthProvider', {
      sessionUserId,
      confirmedUserId,
      resolvedUserId,
      hasSession: Boolean(session),
      isLoading,
    });
  }, [sessionUserId, confirmedUserId, resolvedUserId, session, isLoading]);

  useEffect(() => {
    if (sessionUserId) {
      setConfirmedUserId(sessionUserId);
    }
  }, [sessionUserId]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const confirmAuthenticatedUser = useCallback((userId: string | null) => {
    setConfirmedUserId(userId);
    logAuthDebug('confirmAuthenticatedUser', { userId });
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setSession(null);
    setConfirmedUserId(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      resolvedUserId,
      isLoading,
      isConfigured,
      confirmAuthenticatedUser,
      signOut,
    }),
    [session, resolvedUserId, isLoading, isConfigured, confirmAuthenticatedUser, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
