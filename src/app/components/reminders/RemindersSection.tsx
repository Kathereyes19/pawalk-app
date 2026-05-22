import React from 'react';
import { motion } from 'motion/react';
import { Bell, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useReminders } from '@/contexts/RemindersContext';
import { ProfileSectionCard } from '../profile/ProfileSectionCard';

interface RemindersSectionProps {
  onOpenReminders: () => void;
}

export const RemindersSection: React.FC<RemindersSectionProps> = ({ onOpenReminders }) => {
  const { t } = useLanguage();
  const { statusCounts } = useReminders();

  const pendingCount = statusCounts.upcoming + statusCounts.overdue;

  return (
    <ProfileSectionCard
      title={t('reminders.title')}
      description={t('reminders.sectionDesc')}
    >
      <button
        type="button"
        onClick={onOpenReminders}
        className="w-full text-left"
      >
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="mx-1 mb-2 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-4 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{t('reminders.manage')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pendingCount > 0
                ? t('reminders.sectionPending').replace('{count}', String(pendingCount))
                : t('reminders.sectionEmpty')}
            </p>
            {statusCounts.overdue > 0 && (
              <p className="text-xs text-destructive font-medium mt-1">
                {t('reminders.sectionOverdue').replace('{count}', String(statusCounts.overdue))}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </motion.div>
      </button>
    </ProfileSectionCard>
  );
};
