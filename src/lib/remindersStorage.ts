import type { PetCareReminder } from '@/types';

const PREFIX = 'pawalk_reminders_';
const ALERT_PREFIX = 'pawalk_reminder_alerts_';

function storageKey(userId: string): string {
  return `${PREFIX}${userId}`;
}

function alertKey(userId: string): string {
  return `${ALERT_PREFIX}${userId}`;
}

export function loadStoredReminders(userId: string): PetCareReminder[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as PetCareReminder[];
  } catch {
    return [];
  }
}

export function saveStoredReminders(userId: string, reminders: PetCareReminder[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(reminders));
}

export function clearStoredReminders(userId: string): void {
  localStorage.removeItem(storageKey(userId));
}

export function loadFiredReminderAlerts(userId: string): string[] {
  try {
    const raw = localStorage.getItem(alertKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function markReminderAlertFired(userId: string, reminderId: string): void {
  const fired = new Set(loadFiredReminderAlerts(userId));
  fired.add(reminderId);
  localStorage.setItem(alertKey(userId), JSON.stringify([...fired]));
}

export function clearFiredReminderAlert(userId: string, reminderId: string): void {
  const fired = loadFiredReminderAlerts(userId).filter((id) => id !== reminderId);
  localStorage.setItem(alertKey(userId), JSON.stringify(fired));
}
