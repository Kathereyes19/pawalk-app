export type ReminderCategory =
  | 'vaccination'
  | 'medication'
  | 'deworming'
  | 'walks'
  | 'feeding'
  | 'grooming'
  | 'vet_visit';

export type ReminderStatus = 'upcoming' | 'completed' | 'overdue';

export type ReminderFilterTab = 'upcoming' | 'overdue' | 'completed' | 'all';

export interface PetCareReminder {
  id: string;
  userId: string;
  petId: string | null;
  petName: string | null;
  title: string;
  category: ReminderCategory;
  notes: string | null;
  dueDate: string;
  dueTime: string;
  isCompleted: boolean;
  completedAt: string | null;
  notifiedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PetCareReminderRow {
  id: string;
  user_id: string;
  pet_id: string | null;
  pet_name: string | null;
  title: string;
  category: ReminderCategory;
  notes: string | null;
  due_date: string;
  due_time: string;
  is_completed: boolean;
  completed_at: string | null;
  notified_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReminderInput {
  title: string;
  petId: string | null;
  petName?: string | null;
  category: ReminderCategory;
  dueDate: string;
  dueTime: string;
  notes?: string | null;
}

export interface UpdateReminderInput {
  title?: string;
  petId?: string | null;
  petName?: string | null;
  category?: ReminderCategory;
  dueDate?: string;
  dueTime?: string;
  notes?: string | null;
  isCompleted?: boolean;
}
