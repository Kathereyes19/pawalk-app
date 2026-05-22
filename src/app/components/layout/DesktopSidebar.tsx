import React from 'react';
import { Home, Calendar, PawPrint, User, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../utils/cn';
import type { BottomNavTab } from '@/navigation';
import iconOnlyLogo from '../../../imports/Icon-only_version.png';

interface DesktopSidebarProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'home' as const, icon: Home, label: t('nav.home') },
    { id: 'bookings' as const, icon: Calendar, label: t('nav.bookings') },
    { id: 'marketplace' as const, icon: Store, label: t('nav.marketplace') },
    { id: 'pets' as const, icon: PawPrint, label: t('nav.pets') },
    { id: 'profile' as const, icon: User, label: t('nav.profile') },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-[240px] lg:w-[260px] shrink-0 h-full border-r border-border bg-card/95 backdrop-blur-md z-50">
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={iconOnlyLogo} alt="Pawalk" className="w-10 h-10 object-contain" />
          <div>
            <p className="font-bold text-lg leading-tight">Pawalk</p>
            <p className="text-xs text-muted-foreground">Cuidado para mascotas</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="desktopNavActive"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon className={cn('w-5 h-5 relative z-10', isActive && 'text-primary')} strokeWidth={isActive ? 2.5 : 2} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-border text-xs text-muted-foreground">
        © Pawalk
      </div>
    </aside>
  );
};
