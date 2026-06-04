import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../../components/Button';
import { ADMIN_NAV_ITEMS } from '../../components/layout/navConfig';
import { AdminDashboardScreen } from './AdminDashboardScreen';
import { AdminUsersScreen } from './AdminUsersScreen';
import { AdminAnalyticsScreen } from './AdminAnalyticsScreen';
import { MarketplaceScreen } from '../MarketplaceScreen';
import { ReservationsScreen } from '../ReservationsScreen';
import type { AdminTab } from '@/navigation';

interface AdminScreenProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  onViewTracking: Parameters<typeof ReservationsScreen>[0]['onViewTracking'];
  onViewWalkDetail: Parameters<typeof ReservationsScreen>[0]['onViewWalkDetail'];
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  activeTab,
  onTabChange,
  onExitAdmin,
  onViewTracking,
  onViewWalkDetail,
}) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardScreen />;
      case 'users':
        return <AdminUsersScreen />;
      case 'reservations':
        return (
          <ReservationsScreen
            onViewTracking={onViewTracking}
            onViewWalkDetail={onViewWalkDetail}
          />
        );
      case 'marketplace':
        return <MarketplaceScreen />;
      case 'analytics':
        return <AdminAnalyticsScreen />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background-secondary overflow-hidden">
      <div className="md:hidden sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <Button size="sm" variant="ghost" onClick={onExitAdmin}>
            <ArrowLeft className="w-4 h-4" />
            App
          </Button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="w-4 h-4 text-primary" />
            Admin
          </div>
          <div className="w-16" />
        </div>
        <div className="px-3 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {ADMIN_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">{renderContent()}</div>
    </div>
  );
};
