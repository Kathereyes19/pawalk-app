import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { formatReminderSummary, type ReminderStatusCounts } from '@/lib/reminderUtils';

interface ReminderSummaryTextProps {
  statusCounts: ReminderStatusCounts;
  className?: string;
}

export const ReminderSummaryText: React.FC<ReminderSummaryTextProps> = ({
  statusCounts,
  className = 'text-xs text-muted-foreground mt-0.5',
}) => {
  const { t } = useLanguage();

  const summary = formatReminderSummary(statusCounts, {
    upcoming: t('reminders.summary.upcoming'),
    overdue: t('reminders.summary.overdue'),
    completed: t('reminders.summary.completed'),
    empty: t('reminders.sectionEmpty'),
  });

  return <p className={className}>{summary}</p>;
};
