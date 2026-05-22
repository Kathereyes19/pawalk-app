import React from 'react';
import { Calendar, Clock, MapPin, Navigation, PawPrint, Route, Timer, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Card } from '../Card';
import {
  formatCurrency,
  formatDuration,
  formatReservationDate,
  formatReservationTime,
  formatReservationPetsLabel,
  getReservationPetCount,
  getMinutesUntilStart,
  getWalkProgress,
  resolveEffectiveStatus,
} from '@/features/reservations';
import type { Reservation, ReservationTab } from '@/types';

interface ReservationCardProps {
  reservation: Reservation;
  locale: 'es' | 'en';
  statusLabel: string;
  section: ReservationTab;
  onTrack?: (reservation: Reservation) => void;
  onViewDetail?: (reservation: Reservation) => void;
  trackLabel?: string;
  startsInLabel?: string;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  locale,
  statusLabel,
  section,
  onTrack,
  onViewDetail,
  trackLabel,
  startsInLabel,
}) => {
  const effectiveStatus = resolveEffectiveStatus(reservation);
  const isActive = effectiveStatus === 'active';
  const isCompleted = effectiveStatus === 'completed';
  const isUpcoming = effectiveStatus === 'scheduled';
  const progress = getWalkProgress(reservation);
  const minutesUntilStart = getMinutesUntilStart(reservation);
  const petsLabel = formatReservationPetsLabel(reservation);
  const petCount = getReservationPetCount(reservation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      layout
    >
      <Card
        padding="md"
        onClick={
          isCompleted && section === 'history' && onViewDetail
            ? () => onViewDetail(reservation)
            : undefined
        }
        hoverable={isCompleted && section === 'history' && Boolean(onViewDetail)}
        className={
          isActive
            ? 'border-2 border-primary/30 bg-primary/5 shadow-md'
            : isCompleted
              ? 'border border-border cursor-pointer'
              : undefined
        }
      >
        <div className="flex items-start gap-3">
          <Avatar emoji={reservation.walkerAvatar} size="lg" className="rounded-xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{reservation.walkerName}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <PawPrint className="w-3.5 h-3.5" />
                  {petsLabel}
                  {petCount > 1 && ` (${petCount})`}
                </p>
              </div>
              <Badge
                className={
                  isActive
                    ? 'bg-primary/15 text-primary border-primary/20 shrink-0'
                    : isCompleted
                      ? 'bg-muted text-muted-foreground border-border shrink-0'
                      : 'bg-info/10 text-info border-info/20 shrink-0'
                }
              >
                {statusLabel}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {formatReservationDate(reservation.scheduledDate, locale)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0" />
                <span>
                  {formatReservationTime(reservation.scheduledTime)} · {reservation.durationMinutes}{' '}
                  min
                </span>
              </div>
            </div>

            {isUpcoming && section === 'upcoming' && minutesUntilStart > 0 && startsInLabel && (
              <p className="text-xs text-info mt-2 font-medium">
                {startsInLabel.replace('{minutes}', String(minutesUntilStart))}
              </p>
            )}

            {isActive && section === 'active' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{Math.round(progress)}% completado</span>
                  <span>{formatDuration(Math.floor((progress / 100) * reservation.durationMinutes * 60))}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="font-bold text-primary">
                {formatCurrency(reservation.totalPrice, locale)}
              </span>
              {isCompleted && reservation.summaryDistanceKm != null && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Route className="w-3.5 h-3.5" />
                  {reservation.summaryDistanceKm} km
                </span>
              )}
            </div>

            {isActive && section === 'active' && onTrack && trackLabel && (
              <Button fullWidth size="md" className="mt-3" onClick={() => onTrack(reservation)}>
                <Navigation className="w-4 h-4" />
                {trackLabel}
              </Button>
            )}

            {isCompleted && section === 'history' && (
              <div className="mt-3 p-3 rounded-xl bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Resumen del paseo
                  </p>
                  {onViewDetail && (
                    <span className="text-xs font-medium text-primary flex items-center gap-0.5">
                      Ver detalle
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-primary" />
                    <span>
                      {reservation.summaryDurationMinutes ?? reservation.durationMinutes} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{reservation.summaryDistanceKm ?? '—'} km</span>
                  </div>
                </div>
                {reservation.completedAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(reservation.completedAt).toLocaleString(
                      locale === 'en' ? 'en-US' : 'es-CO',
                      { dateStyle: 'medium', timeStyle: 'short' }
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
