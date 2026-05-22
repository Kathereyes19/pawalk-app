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
import { resolveUserId } from '@/lib/mockUser';
import {
  createReservation,
  fetchReservationsByUserId,
  updateReservationStatus,
  type CreateReservationInput,
} from '@/features/reservations';
import type { Reservation, ReservationStatus } from '@/types';

export interface ReservationsContextValue {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  lastCreatedReservationId: string | null;
  refreshReservations: () => Promise<void>;
  bookReservation: (input: CreateReservationInput) => Promise<{ error: string | null }>;
  setReservationStatus: (
    reservationId: string,
    status: ReservationStatus
  ) => Promise<{ error: string | null }>;
  clearLastCreatedReservation: () => void;
}

const ReservationsContext = createContext<ReservationsContextValue | undefined>(undefined);

export const ReservationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, session, isLoading: authLoading } = useAuth();
  const userId = resolveUserId(user?.id ?? null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedReservationId, setLastCreatedReservationId] = useState<string | null>(null);

  const refreshReservations = useCallback(async () => {
    if (!userId) {
      setReservations([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    const { reservations: next, error: fetchError } = await fetchReservationsByUserId(userId);
    setReservations(next);
    setError(fetchError?.message ?? null);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;

    if (!session && !userId) {
      setReservations([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    void refreshReservations();
  }, [authLoading, session, userId, refreshReservations]);

  const bookReservation = useCallback(
    async (input: CreateReservationInput) => {
      if (!userId) {
        return { error: 'No authenticated user' };
      }

      const { reservation, error: createError } = await createReservation(userId, input);
      if (createError || !reservation) {
        return { error: createError?.message ?? 'Could not create reservation' };
      }

      setLastCreatedReservationId(reservation.id);
      await refreshReservations();
      return { error: null };
    },
    [userId, refreshReservations]
  );

  const setReservationStatus = useCallback(
    async (reservationId: string, status: ReservationStatus) => {
      if (!userId) {
        return { error: 'No authenticated user' };
      }

      const { error: updateError } = await updateReservationStatus(userId, reservationId, status);
      if (updateError) {
        return { error: updateError.message };
      }

      await refreshReservations();
      return { error: null };
    },
    [userId, refreshReservations]
  );

  const clearLastCreatedReservation = useCallback(() => {
    setLastCreatedReservationId(null);
  }, []);

  const value = useMemo<ReservationsContextValue>(
    () => ({
      reservations,
      isLoading: authLoading || isLoading,
      error,
      lastCreatedReservationId,
      refreshReservations,
      bookReservation,
      setReservationStatus,
      clearLastCreatedReservation,
    }),
    [
      reservations,
      authLoading,
      isLoading,
      error,
      lastCreatedReservationId,
      refreshReservations,
      bookReservation,
      setReservationStatus,
      clearLastCreatedReservation,
    ]
  );

  return (
    <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>
  );
};

export function useReservations(): ReservationsContextValue {
  const context = useContext(ReservationsContext);
  if (!context) {
    throw new Error('useReservations must be used within a ReservationsProvider');
  }
  return context;
}
