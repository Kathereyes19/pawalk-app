import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadUserBundle, resolveUserRole } from '@/features/user';
import { resolveUserId } from '@/lib/mockUser';
import type { Pet, UserProfile } from '@/types';
import type { UserRole } from '@/types/role';

export interface UserDataContextValue {
  userId: string | null;
  profile: UserProfile | null;
  pets: Pet[];
  onboardingCompleted: boolean;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setPets: (pets: Pet[]) => void;
  setOnboardingCompleted: (value: boolean) => void;
  refreshUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextValue | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, session, isLoading: authLoading } = useAuth();
  const userId = resolveUserId(user?.id ?? null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const role = useMemo(
    () => resolveUserRole(profile, profile?.email ?? user?.email ?? null),
    [profile, user?.email]
  );
  const isAdmin = role === 'admin';

  const refreshUserData = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setPets([]);
      setOnboardingCompleted(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const bundle = await loadUserBundle(userId);
    setProfile(bundle.profile);
    setPets(bundle.pets);
    setOnboardingCompleted(bundle.onboardingCompleted);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;

    if (!session && !userId) {
      setProfile(null);
      setPets([]);
      setOnboardingCompleted(false);
      setIsLoading(false);
      return;
    }

    refreshUserData();
  }, [authLoading, session, userId, refreshUserData]);

  const value = useMemo<UserDataContextValue>(
    () => ({
      userId,
      profile,
      pets,
      onboardingCompleted,
      role,
      isAdmin,
      isLoading: authLoading || isLoading,
      setProfile,
      setPets,
      setOnboardingCompleted,
      refreshUserData,
    }),
    [
      userId,
      profile,
      pets,
      onboardingCompleted,
      role,
      isAdmin,
      authLoading,
      isLoading,
      refreshUserData,
    ]
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};

export function useUserData(): UserDataContextValue {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
