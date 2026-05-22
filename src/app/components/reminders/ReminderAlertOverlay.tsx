import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Calendar, Clock, PawPrint, X } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useReminders } from '@/contexts/RemindersContext';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { CATEGORY_META, formatReminderDateTime } from '@/lib/reminderUtils';

export const ReminderAlertOverlay: React.FC = () => {
  const { t } = useLanguage();
  const { activeAlert, dismissAlert, snoozeAlert, markComplete } = useReminders();

  if (!activeAlert) return null;

  const { reminder } = activeAlert;
  const categoryMeta = CATEGORY_META[reminder.category];

  const handleComplete = async () => {
    await markComplete(reminder.id);
    dismissAlert();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden border border-primary/20"
        >
          <div className={`h-2 bg-gradient-to-r ${categoryMeta.gradient}`} />

          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${categoryMeta.gradient} flex items-center justify-center text-2xl shadow-lg`}
                >
                  {categoryMeta.emoji}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {t('reminders.alert.title')}
                  </p>
                  <h3 className="text-lg font-bold mt-0.5">{reminder.title}</h3>
                </div>
              </div>
              <IconButton variant="ghost" onClick={dismissAlert}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span>{t(categoryMeta.labelKey)}</span>
              </div>
              {reminder.petName && (
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-primary" />
                  <span>{reminder.petName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{formatReminderDateTime(reminder.dueDate, reminder.dueTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{reminder.dueTime}</span>
              </div>
            </div>

            {reminder.notes && (
              <div className="rounded-2xl bg-muted/50 p-3 text-sm mb-4">{reminder.notes}</div>
            )}

            <div className="grid grid-cols-1 gap-2">
              <Button fullWidth onClick={handleComplete}>
                {t('reminders.markComplete')}
              </Button>
              <Button fullWidth variant="secondary" onClick={() => snoozeAlert(10)}>
                {t('reminders.snooze')}
              </Button>
              <Button fullWidth variant="ghost" onClick={dismissAlert}>
                {t('reminders.dismiss')}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
