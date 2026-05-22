import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveUserId } from '@/lib/mockUser';
import {
  countRemindersByStatus,
  filterRemindersByTab,
  isReminderDue,
} from '@/lib/reminderUtils';
import {
  clearFiredReminderAlert,
  loadFiredReminderAlerts,
  markReminderAlertFired,
} from '@/lib/remindersStorage';
import {
  completeReminder,
  createReminder,
  deleteReminder,
  fetchRemindersByUserId,
  markReminderNotified,
  updateReminder,
} from '@/features/reminders';
import type {
  CreateReminderInput,
  PetCareReminder,
  ReminderFilterTab,
  UpdateReminderInput,
} from '@/types';

export interface ActiveReminderAlert {
  reminder: PetCareReminder;
}

export interface RemindersContextValue {
  reminders: PetCareReminder[];
  isLoading: boolean;
  error: string | null;
  activeAlert: ActiveReminderAlert | null;
  statusCounts: ReturnType<typeof countRemindersByStatus>;
  refreshReminders: () => Promise<void>;
  addReminder: (input: CreateReminderInput) => Promise<{ error: string | null }>;
  editReminder: (
    reminderId: string,
    input: UpdateReminderInput
  ) => Promise<{ error: string | null }>;
  removeReminder: (reminderId: string) => Promise<{ error: string | null }>;
  markComplete: (reminderId: string) => Promise<{ error: string | null }>;
  dismissAlert: () => void;
  snoozeAlert: (minutes?: number) => void;
  getFilteredReminders: (tab: ReminderFilterTab) => PetCareReminder[];
  requestNotificationPermission: () => Promise<NotificationPermission | 'unsupported'>;
}

const RemindersContext = createContext<RemindersContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 30_000;

export const RemindersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, session, isLoading: authLoading } = useAuth();
  const userId = resolveUserId(user?.id ?? null);

  const [reminders, setReminders] = useState<PetCareReminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<ActiveReminderAlert | null>(null);
  const snoozedUntilRef = useRef<number>(0);

  const refreshReminders = useCallback(async () => {
    if (!userId) {
      setReminders([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    const { reminders: fetched, error: fetchError } = await fetchRemindersByUserId(userId);
    setReminders(fetched);
    setError(fetchError?.message ?? null);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    if (!session && !userId) {
      setReminders([]);
      return;
    }
    void refreshReminders();
  }, [authLoading, session, userId, refreshReminders]);

  const fireAlert = useCallback(
    async (reminder: PetCareReminder) => {
      if (!userId) return;

      const fired = loadFiredReminderAlerts(userId);
      if (fired.includes(reminder.id)) return;

      markReminderAlertFired(userId, reminder.id);
      await markReminderNotified(userId, reminder.id);
      setActiveAlert({ reminder });
      await refreshReminders();

      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(reminder.title, {
            body: reminder.petName
              ? `${reminder.petName} · ${reminder.notes ?? 'Es hora del cuidado programado'}`
              : reminder.notes ?? 'Es hora del cuidado programado',
            tag: reminder.id,
          });
        }
      }
    },
    [userId, refreshReminders]
  );

  const checkDueReminders = useCallback(() => {
    if (!userId || Date.now() < snoozedUntilRef.current) return;

    const due = reminders.find(
      (reminder) =>
        isReminderDue(reminder) &&
        !loadFiredReminderAlerts(userId).includes(reminder.id)
    );

    if (due) {
      void fireAlert(due);
    }
  }, [userId, reminders, fireAlert]);

  useEffect(() => {
    checkDueReminders();
    const interval = window.setInterval(checkDueReminders, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [checkDueReminders]);

  const addReminder = useCallback(
    async (input: CreateReminderInput) => {
      if (!userId) return { error: 'Inicia sesión para crear recordatorios.' };
      const { reminder, error: createError } = await createReminder(userId, input);
      if (createError || !reminder) {
        return { error: createError?.message ?? 'No se pudo crear el recordatorio.' };
      }
      if (userId) clearFiredReminderAlert(userId, reminder.id);
      await refreshReminders();
      return { error: null };
    },
    [userId, refreshReminders]
  );

  const editReminder = useCallback(
    async (reminderId: string, input: UpdateReminderInput) => {
      if (!userId) return { error: 'Inicia sesión para editar recordatorios.' };
      const { error: updateError } = await updateReminder(userId, reminderId, input);
      if (updateError) return { error: updateError.message };
      if (userId) clearFiredReminderAlert(userId, reminderId);
      await refreshReminders();
      return { error: null };
    },
    [userId, refreshReminders]
  );

  const removeReminder = useCallback(
    async (reminderId: string) => {
      if (!userId) return { error: 'Inicia sesión para eliminar recordatorios.' };
      const { error: deleteError } = await deleteReminder(userId, reminderId);
      if (deleteError) return { error: deleteError.message };
      await refreshReminders();
      return { error: null };
    },
    [userId, refreshReminders]
  );

  const markComplete = useCallback(
    async (reminderId: string) => {
      if (!userId) return { error: 'Inicia sesión para actualizar recordatorios.' };
      const { error: completeError } = await completeReminder(userId, reminderId);
      if (completeError) return { error: completeError.message };
      await refreshReminders();
      return { error: null };
    },
    [userId, refreshReminders]
  );

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  const snoozeAlert = useCallback((minutes = 10) => {
    snoozedUntilRef.current = Date.now() + minutes * 60_000;
    setActiveAlert(null);
  }, []);

  const getFilteredReminders = useCallback(
    (tab: ReminderFilterTab) => filterRemindersByTab(reminders, tab),
    [reminders]
  );

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported' as const;
    }
    if (Notification.permission === 'granted') return Notification.permission;
    if (Notification.permission === 'denied') return Notification.permission;
    return Notification.requestPermission();
  }, []);

  const statusCounts = useMemo(() => countRemindersByStatus(reminders), [reminders]);

  const value = useMemo<RemindersContextValue>(
    () => ({
      reminders,
      isLoading,
      error,
      activeAlert,
      statusCounts,
      refreshReminders,
      addReminder,
      editReminder,
      removeReminder,
      markComplete,
      dismissAlert,
      snoozeAlert,
      getFilteredReminders,
      requestNotificationPermission,
    }),
    [
      reminders,
      isLoading,
      error,
      activeAlert,
      statusCounts,
      refreshReminders,
      addReminder,
      editReminder,
      removeReminder,
      markComplete,
      dismissAlert,
      snoozeAlert,
      getFilteredReminders,
      requestNotificationPermission,
    ]
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
};

export function useReminders(): RemindersContextValue {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
}
