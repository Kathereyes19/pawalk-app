import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import {
  getReminderFilterCount,
  REMINDER_DASHBOARD_STATUSES,
  type ReminderStatusCounts,
} from '@/lib/reminderUtils';
import type { ReminderFilterTab, ReminderStatus } from '@/types';

interface ReminderStatusDashboardProps {
  statusCounts: ReminderStatusCounts;
  activeFilter: ReminderFilterTab;
  onFilterChange: (filter: ReminderFilterTab) => void;
}

const STATUS_STYLES: Record<
  ReminderStatus,
  { active: string; count: string; idle: string }
> = {
  upcoming: {
    active: 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md',
    count: 'text-primary',
    idle: 'border-border bg-card hover:border-primary/30 hover:bg-primary/5',
  },
  overdue: {
    active: 'border-destructive bg-destructive/10 ring-2 ring-destructive/30 shadow-md',
    count: 'text-destructive',
    idle: 'border-border bg-card hover:border-destructive/30 hover:bg-destructive/5',
  },
  completed: {
    active: 'border-success bg-success/10 ring-2 ring-success/30 shadow-md',
    count: 'text-success',
    idle: 'border-border bg-card hover:border-success/30 hover:bg-success/5',
  },
};

export const ReminderStatusDashboard: React.FC<ReminderStatusDashboardProps> = ({
  statusCounts,
  activeFilter,
  onFilterChange,
}) => {
  const { t } = useLanguage();
  const totalCount = getReminderFilterCount(statusCounts, 'all');

  return (
    <div className="space-y-3">
      <div
        className="grid grid-cols-3 gap-2"
        role="tablist"
        aria-label={t('reminders.dashboardLabel')}
      >
        {REMINDER_DASHBOARD_STATUSES.map((status) => {
          const isActive = activeFilter === status;
          const styles = STATUS_STYLES[status];
          const count = statusCounts[status];

          return (
            <motion.button
              key={status}
              type="button"
              role="tab"
              aria-selected={isActive}
              whileTap={{ scale: 0.97 }}
              onClick={() => onFilterChange(status)}
              className={`rounded-2xl border p-3 text-center transition-all touch-manipulation min-h-[4.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isActive ? styles.active : styles.idle
              }`}
            >
              <p className={`text-2xl font-bold tabular-nums ${isActive ? styles.count : 'text-foreground'}`}>
                {count}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground mt-0.5 leading-tight">
                {t(`reminders.tab.${status}`)}
              </p>
            </motion.button>
          );
        })}
      </div>

      {totalCount > 0 && (
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'all'}
          onClick={() => onFilterChange('all')}
          className={`w-full text-center text-sm font-medium py-2 rounded-xl transition-colors touch-manipulation min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            activeFilter === 'all'
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
          }`}
        >
          {t('reminders.tab.all')} ({totalCount})
        </button>
      )}
    </div>
  );
};
