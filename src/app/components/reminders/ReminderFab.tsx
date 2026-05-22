import React from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ReminderFabProps {
  onClick: () => void;
}

export const ReminderFab: React.FC<ReminderFabProps> = ({ onClick }) => {
  const { t } = useLanguage();
  const label = t('reminders.fab.add');

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className="fixed bottom-24 right-4 z-20 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 px-5 py-3.5 min-h-12 min-w-[3rem] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Plus className="w-5 h-5 shrink-0" aria-hidden="true" strokeWidth={2.5} />
      <span className="font-semibold text-sm whitespace-nowrap">{label}</span>
    </motion.button>
  );
};
