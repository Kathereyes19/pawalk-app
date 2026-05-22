import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '../Button';
import { Input } from '../Input';
import { IconButton } from '../IconButton';
import {
  CATEGORY_META,
  REMINDER_CATEGORIES,
  normalizeTimeValue,
  validateReminderForm,
} from '@/lib/reminderUtils';
import type { CreateReminderInput, PetCareReminder, ReminderCategory } from '@/types';

interface AddReminderSheetProps {
  open: boolean;
  mode?: 'add' | 'edit';
  initialReminder?: PetCareReminder | null;
  defaultPetId?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateReminderInput) => Promise<{ error: string | null }>;
}

export const AddReminderSheet: React.FC<AddReminderSheetProps> = ({
  open,
  mode = 'add',
  initialReminder,
  defaultPetId,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const { pets } = useUserData();
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState('');
  const [petId, setPetId] = useState<string>('');
  const [category, setCategory] = useState<ReminderCategory>('vaccination');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (isEdit && initialReminder) {
      setTitle(initialReminder.title);
      setPetId(initialReminder.petId ?? '');
      setCategory(initialReminder.category);
      setDueDate(initialReminder.dueDate);
      setDueTime(initialReminder.dueTime);
      setNotes(initialReminder.notes ?? '');
    } else {
      setTitle('');
      setPetId(defaultPetId ?? pets[0]?.id ?? '');
      setCategory('vaccination');
      setDueDate('');
      setDueTime('09:00');
      setNotes('');
    }
    setErrors({});
  }, [open, isEdit, initialReminder, defaultPetId, pets]);

  const selectedPet = pets.find((pet) => pet.id === petId);

  const handleSubmit = async () => {
    const payload: CreateReminderInput = {
      title,
      petId: petId || null,
      petName: selectedPet?.name ?? initialReminder?.petName ?? null,
      category,
      dueDate,
      dueTime: normalizeTimeValue(dueTime),
      notes: notes.trim() || null,
    };

    const validation = validateReminderForm(payload);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setIsSaving(true);
    const result = await onSubmit(payload);
    setIsSaving(false);

    if (result.error) {
      setErrors({ form: result.error });
      return;
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute bottom-0 left-0 right-0 max-h-[92vh] bg-card rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold">
                  {isEdit ? t('reminders.edit') : t('reminders.add')}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('reminders.form.subtitle')}
                </p>
              </div>
              <IconButton variant="ghost" onClick={onClose}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <Input
                label={t('reminders.form.title')}
                placeholder={t('reminders.form.titlePlaceholder')}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                error={errors.title}
              />

              <div>
                <label className="text-sm font-medium mb-2 block">{t('reminders.form.pet')}</label>
                <select
                  value={petId}
                  onChange={(event) => setPetId(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">{t('reminders.form.noPet')}</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t('reminders.form.category')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {REMINDER_CATEGORIES.map((item) => {
                    const meta = CATEGORY_META[item];
                    const selected = category === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategory(item)}
                        className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                          selected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <span className="text-lg">{meta.emoji}</span>
                        <p className="text-xs font-semibold mt-1">{t(meta.labelKey)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t('reminders.form.date')}
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  error={errors.dueDate}
                />
                <Input
                  label={t('reminders.form.time')}
                  type="time"
                  value={dueTime}
                  onChange={(event) => setDueTime(event.target.value)}
                  error={errors.dueTime}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t('reminders.form.notes')}</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t('reminders.form.notesPlaceholder')}
                  rows={3}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {errors.form && (
                <p className="text-sm text-destructive font-medium">{errors.form}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Bell className="w-4 h-4 text-primary" />
                {t('reminders.form.alertHint')}
              </div>
            </div>

            <div className="p-5 pb-safe border-t border-border shrink-0">
              <Button fullWidth size="xl" onClick={handleSubmit} loading={isSaving}>
                {isEdit ? t('save') : t('reminders.create')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
