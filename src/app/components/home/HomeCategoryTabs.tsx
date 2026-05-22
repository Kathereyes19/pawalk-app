import React from 'react';
import { motion } from 'motion/react';
import type { HomeServiceCategory } from '@/types/homeDiscovery';
import { HOME_CATEGORIES } from '@/types/homeDiscovery';

interface HomeCategoryTabsProps {
  activeCategory: HomeServiceCategory;
  onChange: (category: HomeServiceCategory) => void;
}

export const HomeCategoryTabs: React.FC<HomeCategoryTabsProps> = ({
  activeCategory,
  onChange,
}) => (
  <div className="px-4 pt-3 pb-2 bg-background border-b border-border shrink-0">
    <div className="flex gap-2 p-1 rounded-2xl bg-muted/60">
      {HOME_CATEGORIES.map((entry) => {
        const isActive = activeCategory === entry.id;
        return (
          <motion.button
            key={entry.id}
            type="button"
            onClick={() => onChange(entry.id)}
            whileTap={{ scale: 0.98 }}
            className={`relative flex-1 min-w-0 rounded-xl px-2 py-2.5 transition-all ${
              isActive
                ? 'bg-card shadow-md text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex flex-col items-center gap-1">
              <span className="text-lg leading-none">{entry.icon}</span>
              <span className="text-xs font-semibold truncate w-full text-center">
                {entry.shortLabel}
              </span>
            </span>
            {isActive && (
              <motion.span
                layoutId="home-category-indicator"
                className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  </div>
);
