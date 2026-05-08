import React from 'react';
import { Home, Calendar, PawPrint, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils/cn';

interface BottomNavProps {
  activeTab: 'home' | 'bookings' | 'pets' | 'profile';
  onTabChange: (tab: 'home' | 'bookings' | 'pets' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'home' as const, icon: Home, label: t('nav.home') },
    { id: 'bookings' as const, icon: Calendar, label: t('nav.bookings') },
    { id: 'pets' as const, icon: PawPrint, label: t('nav.pets') },
    { id: 'profile' as const, icon: User, label: t('nav.profile') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg z-50 pb-safe">
      <div className="flex justify-around items-center max-w-md mx-auto px-2 pt-2 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 py-2 px-3 min-w-[64px] relative touch-manipulation"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1 : 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 relative z-10 transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              <span
                className={cn(
                  'text-xs font-medium relative z-10 transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
