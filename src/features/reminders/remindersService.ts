import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import {
  getReminderDueAt,
  normalizeTimeValue,
  sortReminders,
  validateReminderForm,
} from '@/lib/reminderUtils';
import {
  loadStoredReminders,
  saveStoredReminders,
} from '@/lib/remindersStorage';
import type {
  CreateReminderInput,
  PetCareReminder,
  PetCareReminderRow,
  UpdateReminderInput,
} from '@/types';

function ensureReminderId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `rem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function mapRowToReminder(row: PetCareReminderRow): PetCareReminder {
  return {
    id: row.id,
    userId: row.user_id,
    petId: row.pet_id,
    petName: row.pet_name,
    title: row.title,
    category: row.category,
    notes: row.notes,
    dueDate: row.due_date,
    dueTime: normalizeTimeValue(String(row.due_time).slice(0, 5)),
    isCompleted: row.is_completed,
    completedAt: row.completed_at,
    notifiedAt: row.notified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReminderToRow(
  reminder: PetCareReminder
): Omit<PetCareReminderRow, 'created_at' | 'updated_at'> {
  return {
    id: reminder.id,
    user_id: reminder.userId,
    pet_id: reminder.petId,
    pet_name: reminder.petName,
    title: reminder.title,
    category: reminder.category,
    notes: reminder.notes,
    due_date: reminder.dueDate,
    due_time: reminder.dueTime,
    is_completed: reminder.isCompleted,
    completed_at: reminder.completedAt,
    notified_at: reminder.notifiedAt,
  };
}

function saveLocalReminders(userId: string, reminders: PetCareReminder[]): PetCareReminder[] {
  const normalized = sortReminders(reminders);
  saveStoredReminders(userId, normalized);
  return normalized;
}

export async function fetchRemindersByUserId(
  userId: string
): Promise<{ reminders: PetCareReminder[]; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { reminders: sortReminders(loadStoredReminders(userId)), error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { reminders: sortReminders(loadStoredReminders(userId)), error: null };
  }

  const { data, error } = await supabase
    .from('pet_care_reminders')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true })
    .order('due_time', { ascending: true });

  if (error) {
    return {
      reminders: sortReminders(loadStoredReminders(userId)),
      error: new Error(error.message),
    };
  }

  const remote = (data as PetCareReminderRow[]).map(mapRowToReminder);
  const localById = new Map(loadStoredReminders(userId).map((item) => [item.id, item]));
  const merged = remote.length ? remote : [...localById.values()];
  const normalized = saveLocalReminders(userId, merged);
  return { reminders: normalized, error: null };
}

export async function createReminder(
  userId: string,
  input: CreateReminderInput
): Promise<{ reminder: PetCareReminder | null; error: Error | null }> {
  const formErrors = validateReminderForm(input);
  if (Object.keys(formErrors).length > 0) {
    const firstError = Object.values(formErrors).find(Boolean);
    return { reminder: null, error: new Error(firstError ?? 'Datos inválidos') };
  }

  const now = new Date().toISOString();
  const reminder: PetCareReminder = {
    id: ensureReminderId(),
    userId,
    petId: input.petId,
    petName: input.petName ?? null,
    title: input.title.trim(),
    category: input.category,
    notes: input.notes?.trim() || null,
    dueDate: input.dueDate,
    dueTime: normalizeTimeValue(input.dueTime),
    isCompleted: false,
    completedAt: null,
    notifiedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const next = saveLocalReminders(userId, [...loadStoredReminders(userId), reminder]);

  if (!isSupabaseConfigured()) {
    return { reminder: next.find((item) => item.id === reminder.id) ?? reminder, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { reminder: next.find((item) => item.id === reminder.id) ?? reminder, error: null };
  }

  const { data, error } = await supabase
    .from('pet_care_reminders')
    .insert(mapReminderToRow(reminder))
    .select('*')
    .single();

  if (error) {
    return { reminder: next.find((item) => item.id === reminder.id) ?? reminder, error: null };
  }

  const persisted = mapRowToReminder(data as PetCareReminderRow);
  saveLocalReminders(
    userId,
    next.map((item) => (item.id === reminder.id ? persisted : item))
  );
  return { reminder: persisted, error: null };
}

export async function updateReminder(
  userId: string,
  reminderId: string,
  input: UpdateReminderInput
): Promise<{ reminder: PetCareReminder | null; error: Error | null }> {
  const existing = loadStoredReminders(userId);
  const current = existing.find((item) => item.id === reminderId);
  if (!current) {
    return { reminder: null, error: new Error('Recordatorio no encontrado') };
  }

  const formErrors = validateReminderForm(
    {
      title: input.title ?? current.title,
      dueDate: input.dueDate ?? current.dueDate,
      dueTime: input.dueTime ?? current.dueTime,
      category: input.category ?? current.category,
      petId: input.petId ?? current.petId,
    },
    false
  );
  if (formErrors.title || formErrors.dueDate || formErrors.dueTime) {
    return {
      reminder: null,
      error: new Error(formErrors.title ?? formErrors.dueDate ?? formErrors.dueTime ?? 'Datos inválidos'),
    };
  }

  const isCompleted = input.isCompleted ?? current.isCompleted;
  const dueDate = input.dueDate ?? current.dueDate;
  const dueTime = normalizeTimeValue(input.dueTime ?? current.dueTime);
  const dueChanged =
    dueDate !== current.dueDate ||
    dueTime !== current.dueTime;

  const updated: PetCareReminder = {
    ...current,
    title: input.title?.trim() || current.title,
    petId: input.petId !== undefined ? input.petId : current.petId,
    petName: input.petName !== undefined ? input.petName : current.petName,
    category: input.category ?? current.category,
    notes: input.notes !== undefined ? input.notes?.trim() || null : current.notes,
    dueDate,
    dueTime,
    isCompleted,
    completedAt: isCompleted
      ? input.isCompleted && !current.isCompleted
        ? new Date().toISOString()
        : current.completedAt
      : null,
    notifiedAt: dueChanged || (input.isCompleted === false) ? null : current.notifiedAt,
    updatedAt: new Date().toISOString(),
  };

  const next = saveLocalReminders(
    userId,
    existing.map((item) => (item.id === reminderId ? updated : item))
  );

  if (!isSupabaseConfigured()) {
    return { reminder: next.find((item) => item.id === reminderId) ?? updated, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { reminder: next.find((item) => item.id === reminderId) ?? updated, error: null };
  }

  const { data, error } = await supabase
    .from('pet_care_reminders')
    .update({
      pet_id: updated.petId,
      pet_name: updated.petName,
      title: updated.title,
      category: updated.category,
      notes: updated.notes,
      due_date: updated.dueDate,
      due_time: updated.dueTime,
      is_completed: updated.isCompleted,
      completed_at: updated.completedAt,
      notified_at: updated.notifiedAt,
      updated_at: updated.updatedAt,
    })
    .eq('id', reminderId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    return { reminder: next.find((item) => item.id === reminderId) ?? updated, error: null };
  }

  const persisted = mapRowToReminder(data as PetCareReminderRow);
  saveLocalReminders(
    userId,
    next.map((item) => (item.id === reminderId ? persisted : item))
  );
  return { reminder: persisted, error: null };
}

export async function deleteReminder(
  userId: string,
  reminderId: string
): Promise<{ error: Error | null }> {
  const existing = loadStoredReminders(userId);
  if (!existing.some((item) => item.id === reminderId)) {
    return { error: new Error('Recordatorio no encontrado') };
  }

  saveLocalReminders(
    userId,
    existing.filter((item) => item.id !== reminderId)
  );

  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { error: null };

  const { error } = await supabase
    .from('pet_care_reminders')
    .delete()
    .eq('id', reminderId)
    .eq('user_id', userId);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

export async function markReminderNotified(
  userId: string,
  reminderId: string
): Promise<{ error: Error | null }> {
  const existing = loadStoredReminders(userId);
  const current = existing.find((item) => item.id === reminderId);
  if (!current) return { error: new Error('Recordatorio no encontrado') };

  const updated: PetCareReminder = {
    ...current,
    notifiedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveLocalReminders(
    userId,
    existing.map((item) => (item.id === reminderId ? updated : item))
  );

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase
        .from('pet_care_reminders')
        .update({ notified_at: updated.notifiedAt, updated_at: updated.updatedAt })
        .eq('id', reminderId)
        .eq('user_id', userId);
    }
  }

  return { error: null };
}

export async function completeReminder(
  userId: string,
  reminderId: string
): Promise<{ error: Error | null }> {
  const result = await updateReminder(userId, reminderId, { isCompleted: true });
  return { error: result.error };
}

export function getDueReminders(
  reminders: PetCareReminder[],
  now = new Date()
): PetCareReminder[] {
  return reminders.filter((reminder) => {
    if (reminder.isCompleted) return false;
    return getReminderDueAt(reminder) <= now;
  });
}
