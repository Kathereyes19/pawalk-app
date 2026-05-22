import React from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  PawPrint,
} from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { Avatar } from '../Avatar';
import { getPetAvatarProps } from '@/lib/images';
import {
  CATEGORY_META,
  formatReminderDateTime,
  getReminderStatus,
} from '@/lib/reminderUtils';
import type { PetCareReminder } from '@/types';

interface ReminderCardProps {
  reminder: PetCareReminder;
  petEmoji?: string;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  petEmoji = '🐾',
  onComplete,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();
  const status = getReminderStatus(reminder);
  const categoryMeta = CATEGORY_META[reminder.category];

  const statusBadge =
    status === 'completed'
      ? { label: t('reminders.status.completed'), className: 'bg-success/10 text-success' }
      : status === 'overdue'
        ? { label: t('reminders.status.overdue'), className: 'bg-destructive/10 text-destructive' }
        : { label: t('reminders.status.upcoming'), className: 'bg-primary/10 text-primary' };

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card padding="md" className="relative overflow-hidden border border-border">
        <div className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${categoryMeta.gradient}`} />

        <div className="relative flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${categoryMeta.gradient} flex items-center justify-center text-xl shadow-md shrink-0`}
          >
            {categoryMeta.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <p className="font-semibold truncate">{reminder.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(categoryMeta.labelKey)}
                </p>
              </div>
              <Badge className={`${statusBadge.className} text-[10px] shrink-0`}>
                {statusBadge.label}
              </Badge>
            </div>

            {reminder.petName && (
              <div className="flex items-center gap-2 mt-2">
                <Avatar
                  {...getPetAvatarProps({
                    avatar: petEmoji,
                    name: reminder.petName ?? undefined,
                    id: reminder.petId ?? undefined,
                  })}
                  size="sm"
                />
                <span className="text-sm font-medium truncate">{reminder.petName}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatReminderDateTime(reminder.dueDate, reminder.dueTime)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {reminder.dueTime}
              </span>
            </div>

            {reminder.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{reminder.notes}</p>
            )}
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            {status !== 'completed' && onComplete && (
              <button
                type="button"
                onClick={onComplete}
                className="min-w-11 min-h-11 p-2.5 rounded-xl hover:bg-success/10 text-muted-foreground hover:text-success transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
                aria-label={t('reminders.markComplete')}
              >
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="min-w-11 min-h-11 p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t('reminders.edit')}
              >
                <MoreVertical className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="min-w-11 min-h-11 p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive text-sm font-semibold"
                aria-label={t('reminders.delete.title')}
              >
                <span aria-hidden="true">✕</span>
              </button>
            )}
          </div>
        </div>

        {status === 'overdue' && (
          <div className="relative mt-3 pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-destructive">
            <Bell className="w-3.5 h-3.5" />
            {t('reminders.overdueHint')}
          </div>
        )}

        {!reminder.petName && (
          <div className="relative mt-3 pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wide">
            <PawPrint className="w-3.5 h-3.5" />
            {t('reminders.noPetSelected')}
          </div>
        )}
      </Card>
    </motion.div>
  );
};
