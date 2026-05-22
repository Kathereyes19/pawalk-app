import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  CalendarDays,
  Loader2,
  AlertCircle,
  RefreshCw,
  History,
  Radio,
  Clock3,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useReservations } from '@/contexts/ReservationsContext';
import { resolveEffectiveStatus } from '@/features/reservations';
import {
  filterReservationsByCategory,
  getReservationCategory,
  type ReservationCategoryFilter,
} from '@/lib/providers/reservationCategory';
import { supportsLiveTracking } from '@/lib/providers/serviceExperience';
import { Button } from '../components/Button';
import { ReservationCard } from '../components/reservations/ReservationCard';
import type { Reservation, ReservationTab } from '@/types';

interface ReservationsScreenProps {
  onViewTracking: (reservation: Reservation) => void;
  onViewWalkDetail: (reservation: Reservation) => void;
}

const tabs: { id: ReservationTab; icon: React.ElementType }[] = [
  { id: 'upcoming', icon: Clock3 },
  { id: 'active', icon: Radio },
  { id: 'history', icon: History },
];

const categoryFilters: { id: ReservationCategoryFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'walkers', label: 'Paseos' },
  { id: 'caregivers', label: 'Cuidado' },
  { id: 'veterinary', label: 'Vet/Servicios' },
];

export const ReservationsScreen: React.FC<ReservationsScreenProps> = ({
  onViewTracking,
  onViewWalkDetail,
}) => {
  const { t, language } = useLanguage();
  const { reservations, isLoading, error, refreshReservations } = useReservations();
  const [activeTab, setActiveTab] = useState<ReservationTab>('upcoming');
  const [categoryFilter, setCategoryFilter] = useState<ReservationCategoryFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredReservations = useMemo(
    () => filterReservationsByCategory(reservations, categoryFilter),
    [reservations, categoryFilter]
  );

  const grouped = useMemo(() => {
    const upcoming: Reservation[] = [];
    const active: Reservation[] = [];
    const history: Reservation[] = [];

    for (const reservation of filteredReservations) {
      const status = resolveEffectiveStatus(reservation);
      if (status === 'scheduled') upcoming.push(reservation);
      else if (status === 'active') active.push(reservation);
      else if (status === 'completed' || status === 'cancelled') history.push(reservation);
    }

    upcoming.sort(
      (a, b) =>
        new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime() -
        new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime()
    );

    return { upcoming, active, history };
  }, [filteredReservations]);

  const currentList =
    activeTab === 'upcoming'
      ? grouped.upcoming
      : activeTab === 'active'
        ? grouped.active
        : grouped.history;

  const statusLabel = (reservation: Reservation) => {
    const status = resolveEffectiveStatus(reservation);
    if (status === 'scheduled') return t('reservations.status.scheduled');
    if (status === 'active') return t('reservations.status.active');
    if (status === 'cancelled') return t('reservations.status.cancelled');
    return t('reservations.status.completed');
  };

  const emptyCopy = () => {
    if (activeTab === 'upcoming') {
      return {
        title: t('reservations.empty.upcoming.title'),
        desc: t('reservations.empty.upcoming.desc'),
        emoji: '📅',
      };
    }
    if (activeTab === 'active') {
      return {
        title: t('reservations.empty.active.title'),
        desc: t('reservations.empty.active.desc'),
        emoji: '🐾',
      };
    }
    return {
      title: t('reservations.empty.history.title'),
      desc: t('reservations.empty.history.desc'),
      emoji: '✨',
    };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshReservations();
    setIsRefreshing(false);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-background-secondary">
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-10">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t('reservations.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('reservations.subtitle')}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            loading={isRefreshing}
            aria-label={t('reservations.refresh')}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-4 pb-3 flex gap-2">
          {tabs.map(({ id, icon: Icon }) => {
            const count =
              id === 'upcoming'
                ? grouped.upcoming.length
                : id === 'active'
                  ? grouped.active.length
                  : grouped.history.length;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex-1 min-w-0 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t(`reservations.tab.${id}`)}</span>
                  {count > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeTab === id ? 'bg-white/20' : 'bg-muted'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categoryFilters.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategoryFilter(id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                categoryFilter === id
                  ? 'bg-secondary text-secondary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">{t('reservations.loading')}</p>
          </div>
        )}

        {!isLoading && error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{t('reservations.error.title')}</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={handleRefresh}>
                  {t('reservations.retry')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {!isLoading && !error && currentList.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-border bg-card p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center text-3xl">
              {emptyCopy().emoji}
            </div>
            <h2 className="text-lg font-bold mb-2">{emptyCopy().title}</h2>
            <p className="text-sm text-muted-foreground">{emptyCopy().desc}</p>
          </motion.div>
        )}

        {!isLoading &&
          !error &&
          currentList.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              locale={language}
              section={activeTab}
              statusLabel={statusLabel(reservation)}
              startsInLabel={t('reservations.startsIn')}
              onTrack={
                activeTab === 'active' &&
                resolveEffectiveStatus(reservation) === 'active' &&
                supportsLiveTracking(getReservationCategory(reservation))
                  ? onViewTracking
                  : undefined
              }
              trackLabel={activeTab === 'active' ? t('reservations.track') : undefined}
              onViewDetail={
                activeTab === 'history' &&
                resolveEffectiveStatus(reservation) === 'completed'
                  ? onViewWalkDetail
                  : undefined
              }
            />
          ))}

        {!isLoading && !error && filteredReservations.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
            {t('reservations.count').replace('{count}', String(filteredReservations.length))}
          </div>
        )}
      </div>
    </div>
  );
};
