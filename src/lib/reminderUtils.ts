import type {
  CreateReminderInput,
  PetCareReminder,
  ReminderCategory,
  ReminderFilterTab,
  ReminderStatus,
  UpdateReminderInput,
} from '@/types';

export const REMINDER_CATEGORIES: ReminderCategory[] = [
  'vaccination',
  'medication',
  'deworming',
  'walks',
  'feeding',
  'grooming',
  'vet_visit',
];

export const CATEGORY_META: Record<
  ReminderCategory,
  { labelKey: string; emoji: string; gradient: string }
> = {
  vaccination: {
    labelKey: 'reminders.category.vaccination',
    emoji: '💉',
    gradient: 'from-blue-500 to-cyan-600',
  },
  medication: {
    labelKey: 'reminders.category.medication',
    emoji: '💊',
    gradient: 'from-violet-500 to-purple-600',
  },
  deworming: {
    labelKey: 'reminders.category.deworming',
    emoji: '🛡️',
    gradient: 'from-emerald-500 to-teal-600',
  },
  walks: {
    labelKey: 'reminders.category.walks',
    emoji: '🐕',
    gradient: 'from-orange-500 to-amber-600',
  },
  feeding: {
    labelKey: 'reminders.category.feeding',
    emoji: '🍽️',
    gradient: 'from-pink-500 to-rose-600',
  },
  grooming: {
    labelKey: 'reminders.category.grooming',
    emoji: '✂️',
    gradient: 'from-fuchsia-500 to-pink-600',
  },
  vet_visit: {
    labelKey: 'reminders.category.vet_visit',
    emoji: '🏥',
    gradient: 'from-red-500 to-rose-600',
  },
};

export function normalizeTimeValue(value: string): string {
  const parts = value.split(':');
  const hours = parts[0]?.padStart(2, '0') ?? '09';
  const minutes = parts[1]?.padStart(2, '0') ?? '00';
  return `${hours}:${minutes}`;
}

export function getReminderDueAt(reminder: Pick<PetCareReminder, 'dueDate' | 'dueTime'>): Date {
  const [year, month, day] = reminder.dueDate.split('-').map(Number);
  const [hours, minutes] = normalizeTimeValue(reminder.dueTime).split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function getReminderStatus(
  reminder: PetCareReminder,
  now = new Date()
): ReminderStatus {
  if (reminder.isCompleted) return 'completed';
  return getReminderDueAt(reminder) < now ? 'overdue' : 'upcoming';
}

export function formatReminderDateTime(
  dueDate: string,
  dueTime: string,
  locale = 'es-CO'
): string {
  const date = getReminderDueAt({ dueDate, dueTime });
  const dateLabel = date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timeLabel = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateLabel} · ${timeLabel}`;
}

export function sortReminders(reminders: PetCareReminder[]): PetCareReminder[] {
  return [...reminders].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return getReminderDueAt(a).getTime() - getReminderDueAt(b).getTime();
  });
}

export function filterRemindersByTab(
  reminders: PetCareReminder[],
  tab: ReminderFilterTab,
  now = new Date()
): PetCareReminder[] {
  const sorted = sortReminders(reminders);
  if (tab === 'all') return sorted;
  return sorted.filter((reminder) => getReminderStatus(reminder, now) === tab);
}

export function validateReminderForm(
  input: CreateReminderInput | UpdateReminderInput,
  requireTitle = true
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (requireTitle && 'title' in input && !input.title?.trim()) {
    errors.title = 'Ingresa un título para el recordatorio';
  }

  if ('dueDate' in input && input.dueDate) {
    const parsed = new Date(`${input.dueDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      errors.dueDate = 'Fecha inválida';
    }
  } else if (requireTitle) {
    errors.dueDate = 'Selecciona una fecha';
  }

  if ('dueTime' in input && input.dueTime && !/^\d{2}:\d{2}$/.test(normalizeTimeValue(input.dueTime))) {
    errors.dueTime = 'Hora inválida';
  }

  return errors;
}

export function isReminderDue(
  reminder: PetCareReminder,
  now = new Date(),
  graceMs = 60_000
): boolean {
  if (reminder.isCompleted || reminder.notifiedAt) return false;
  const dueAt = getReminderDueAt(reminder).getTime();
  return now.getTime() >= dueAt - graceMs;
}

export function countRemindersByStatus(
  reminders: PetCareReminder[],
  now = new Date()
): Record<ReminderStatus, number> {
  return reminders.reduce(
    (acc, reminder) => {
      acc[getReminderStatus(reminder, now)] += 1;
      return acc;
    },
    { upcoming: 0, overdue: 0, completed: 0 }
  );
}

export type ReminderStatusCounts = Record<ReminderStatus, number>;

export const REMINDER_DASHBOARD_STATUSES: ReminderStatus[] = [
  'upcoming',
  'overdue',
  'completed',
];

export function getReminderFilterCount(
  counts: ReminderStatusCounts,
  tab: ReminderFilterTab
): number {
  if (tab === 'all') {
    return counts.upcoming + counts.overdue + counts.completed;
  }
  return counts[tab];
}

export interface ReminderSummaryLabels {
  upcoming: string;
  overdue: string;
  completed: string;
  empty: string;
}

export function formatReminderSummary(
  counts: ReminderStatusCounts,
  labels: ReminderSummaryLabels
): string {
  const total = counts.upcoming + counts.overdue + counts.completed;
  if (total === 0) return labels.empty;

  const segments: string[] = [];
  if (counts.upcoming > 0) {
    segments.push(`${counts.upcoming} ${labels.upcoming}`);
  }
  if (counts.overdue > 0) {
    segments.push(`${counts.overdue} ${labels.overdue}`);
  }
  if (segments.length === 0 && counts.completed > 0) {
    segments.push(`${counts.completed} ${labels.completed}`);
  }

  return segments.length > 0 ? segments.join(' · ') : labels.empty;
}
