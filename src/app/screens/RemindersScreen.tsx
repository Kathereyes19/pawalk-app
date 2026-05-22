import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, Loader2 } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useUserData } from '@/contexts/UserDataContext';
import { useReminders } from '@/contexts/RemindersContext';
import { ConfirmDialog } from '../components/pets/ConfirmDialog';
import { IconButton } from '../components/IconButton';
import { ReminderCard } from '../components/reminders/ReminderCard';
import { ReminderFab } from '../components/reminders/ReminderFab';
import { AddReminderSheet } from '../components/reminders/AddReminderSheet';
import type { PetCareReminder, ReminderFilterTab } from '@/types';

interface RemindersScreenProps {
  onBack: () => void;
}

const FILTER_TABS: ReminderFilterTab[] = ['upcoming', 'overdue', 'completed', 'all'];

export const RemindersScreen: React.FC<RemindersScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { pets } = useUserData();
  const {
    isLoading,
    statusCounts,
    getFilteredReminders,
    addReminder,
    editReminder,
    removeReminder,
    markComplete,
    requestNotificationPermission,
  } = useReminders();

  const [activeTab, setActiveTab] = useState<ReminderFilterTab>('upcoming');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'add' | 'edit'>('add');
  const [editingReminder, setEditingReminder] = useState<PetCareReminder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PetCareReminder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void requestNotificationPermission();
  }, [requestNotificationPermission]);

  const filteredReminders = useMemo(
    () => getFilteredReminders(activeTab),
    [getFilteredReminders, activeTab]
  );

  const petEmojiById = useMemo(
    () => new Map(pets.map((pet) => [pet.id, pet.avatar ?? '🐾'])),
    [pets]
  );

  const openAddSheet = () => {
    setSheetMode('add');
    setEditingReminder(null);
    setSheetOpen(true);
  };

  const openEditSheet = (reminder: PetCareReminder) => {
    setSheetMode('edit');
    setEditingReminder(reminder);
    setSheetOpen(true);
  };

  const handleSheetSubmit = async (payload: Parameters<typeof addReminder>[0]) => {
    if (sheetMode === 'edit' && editingReminder) {
      return editReminder(editingReminder.id, payload);
    }
    return addReminder(payload);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await removeReminder(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const tabLabel = (tab: ReminderFilterTab) => {
    switch (tab) {
      case 'upcoming':
        return t('reminders.tab.upcoming');
      case 'overdue':
        return t('reminders.tab.overdue');
      case 'completed':
        return t('reminders.tab.completed');
      default:
        return t('reminders.tab.all');
    }
  };

  const tabCount = (tab: ReminderFilterTab) => {
    if (tab === 'all') return statusCounts.upcoming + statusCounts.overdue + statusCounts.completed;
    return statusCounts[tab];
  };

  return (
    <div className="h-full overflow-y-auto pb-32 bg-background-secondary">
      <div className="sticky top-0 z-10 bg-gradient-to-br from-primary to-accent px-4 pt-4 pb-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <IconButton
            onClick={onBack}
            variant="ghost"
            aria-label={t('back')}
            className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-0 min-w-11 min-h-11"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </IconButton>
          <div
            className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30"
            aria-hidden="true"
          >
            <Bell className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold text-white">{t('reminders.badge')}</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white">{t('reminders.title')}</h1>
        <p className="text-white/90 text-sm mt-1">{t('reminders.subtitle')}</p>
      </div>

      <div className="px-4 -mt-3">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(['upcoming', 'overdue', 'completed'] as const).map((key) => (
            <div
              key={key}
              className="rounded-2xl bg-card border border-border p-3 text-center shadow-sm"
            >
              <p className="text-xl font-bold text-primary">{statusCounts[key]}</p>
              <p className="text-[11px] text-muted-foreground">{tabLabel(key)}</p>
            </div>
          ))}
        </div>

        <div
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          role="tablist"
          aria-label={t('reminders.filterLabel')}
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2.5 min-h-11 rounded-full text-sm font-semibold transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border border-border text-foreground-secondary hover:bg-muted/60'
              }`}
            >
              {tabLabel(tab)} ({tabCount(tab)})
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : filteredReminders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-14 px-4 rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5"
            role="status"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base mb-1">{t('reminders.empty.title')}</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t('reminders.empty.desc')}
            </p>
            <p className="text-sm text-primary font-medium mt-4">{t('reminders.empty.hint')}</p>
          </motion.div>
        ) : (
          filteredReminders.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <ReminderCard
                reminder={reminder}
                petEmoji={
                  reminder.petId ? petEmojiById.get(reminder.petId) ?? '🐾' : '🐾'
                }
                onComplete={
                  reminder.isCompleted ? undefined : () => void markComplete(reminder.id)
                }
                onEdit={() => openEditSheet(reminder)}
                onDelete={() => setDeleteTarget(reminder)}
              />
            </motion.div>
          ))
        )}
      </div>

      <ReminderFab onClick={openAddSheet} />

      <AddReminderSheet
        open={sheetOpen}
        mode={sheetMode}
        initialReminder={editingReminder}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleSheetSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('reminders.delete.title')}
        description={
          deleteTarget
            ? t('reminders.delete.desc').replace('{title}', deleteTarget.title)
            : ''
        }
        confirmLabel={t('delete')}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
