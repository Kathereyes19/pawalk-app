import React from 'react';
import { ChevronLeft, ChevronRight, Shield, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../utils/cn';
import { useLayout } from './LayoutContext';
import { ADMIN_NAV_ITEMS, CONSUMER_NAV_ITEMS } from './navConfig';
import type { AdminTab, AppLayoutMode, BottomNavTab } from '@/navigation';
import iconOnlyLogo from '../../../imports/Icon-only_version.png';

interface SidebarNavProps {
  layoutMode: AppLayoutMode;
  activeTab: BottomNavTab;
  activeAdminTab: AdminTab;
  isAdmin: boolean;
  onTabChange: (tab: BottomNavTab) => void;
  onAdminTabChange: (tab: AdminTab) => void;
  onEnterAdmin: () => void;
  onExitAdmin: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  layoutMode,
  activeTab,
  activeAdminTab,
  isAdmin,
  onTabChange,
  onAdminTabChange,
  onEnterAdmin,
  onExitAdmin,
}) => {
  const { t } = useLanguage();
  const { sidebarCollapsed, toggleSidebar } = useLayout();
  const isAdminMode = layoutMode === 'admin';

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col shrink-0 h-full border-r border-border bg-card/95 backdrop-blur-md z-50 transition-[width] duration-300',
        sidebarCollapsed ? 'md:w-[72px]' : 'md:w-[240px] lg:w-[260px]'
      )}
    >
      <div className="px-4 pt-5 pb-4 border-b border-border flex items-center justify-between gap-2">
        <div className={cn('flex items-center gap-3 min-w-0', sidebarCollapsed && 'justify-center w-full')}>
          <img src={iconOnlyLogo} alt="Pawalk" className="w-9 h-9 object-contain shrink-0" />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="font-bold text-base leading-tight truncate">Pawalk</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {isAdminMode ? 'Panel de control' : 'Cuidado para mascotas'}
              </p>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground"
            aria-label="Colapsar menú"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {sidebarCollapsed && (
        <div className="px-2 py-2 border-b border-border flex justify-center">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground"
            aria-label="Expandir menú"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {(isAdminMode ? ADMIN_NAV_ITEMS : CONSUMER_NAV_ITEMS).map((item) => {
          const Icon = item.icon;
          const isActive = isAdminMode
            ? activeAdminTab === item.id
            : activeTab === item.id;
          const label = 'labelKey' in item ? t(item.labelKey) : item.label;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                isAdminMode
                  ? onAdminTabChange(item.id as AdminTab)
                  : onTabChange(item.id as BottomNavTab)
              }
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                'relative w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-colors',
                sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-3',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarNavActive"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon
                className={cn('w-5 h-5 relative z-10 shrink-0', isActive && 'text-primary')}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {!sidebarCollapsed && <span className="relative z-10 truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {isAdmin && (
        <div className="px-2 pb-2">
          <button
            type="button"
            onClick={isAdminMode ? onExitAdmin : onEnterAdmin}
            title={sidebarCollapsed ? (isAdminMode ? 'App' : 'Admin') : undefined}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors text-sm font-medium',
              sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-3'
            )}
          >
            {isAdminMode ? (
              <Sparkles className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <Shield className="w-5 h-5 text-primary shrink-0" />
            )}
            {!sidebarCollapsed && (
              <span>{isAdminMode ? 'Volver a la app' : 'Panel admin'}</span>
            )}
          </button>
        </div>
      )}

      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-t border-border text-[11px] text-muted-foreground">
          © Pawalk SaaS
        </div>
      )}
    </aside>
  );
};
