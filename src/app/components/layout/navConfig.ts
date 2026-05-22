import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Calendar,
  Home,
  LayoutDashboard,
  PawPrint,
  Store,
  User,
  Users,
} from 'lucide-react';
import type { AdminTab, BottomNavTab } from '@/navigation';

export interface ConsumerNavItem {
  id: BottomNavTab;
  icon: LucideIcon;
  labelKey: string;
}

export interface AdminNavItem {
  id: AdminTab;
  icon: LucideIcon;
  label: string;
}

export const CONSUMER_NAV_ITEMS: ConsumerNavItem[] = [
  { id: 'home', icon: Home, labelKey: 'nav.home' },
  { id: 'bookings', icon: Calendar, labelKey: 'nav.bookings' },
  { id: 'marketplace', icon: Store, labelKey: 'nav.marketplace' },
  { id: 'pets', icon: PawPrint, labelKey: 'nav.pets' },
  { id: 'profile', icon: User, labelKey: 'nav.profile' },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'users', icon: Users, label: 'Usuarios' },
  { id: 'reservations', icon: Calendar, label: 'Reservas' },
  { id: 'marketplace', icon: Store, label: 'Marketplace' },
  { id: 'analytics', icon: BarChart3, label: 'Analíticas' },
];
