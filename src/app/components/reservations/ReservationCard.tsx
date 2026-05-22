import React from 'react';
import { Calendar, Clock, MapPin, Navigation, PawPrint } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Card } from '../Card';
import {
  formatCurrency,
  formatReservationDate,
  formatReservationTime,
  resolveEffectiveStatus,
} from '@/features/reservations';
import type { Reservation } from '@/types';

interface ReservationCardProps {
  reservation: Reservation;
  locale: 'es' | 'en';
  statusLabel: string;
  onTrack?: (reservation: Reservation) => void;
  trackLabel?: string;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  locale,
  statusLabel,
  onTrack,
  trackLabel,
}) => {
  const effectiveStatus = resolveEffectiveStatus(reservation);
  const isActive = effectiveStatus === 'active';
  const isCompleted = effectiveStatus === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card padding="md" className={isActive ? 'border-2 border-primary/30 bg-primary/5' : undefined}>
        <div className="flex items-start gap-3">
          <Avatar emoji={reservation.walkerAvatar} size="lg" className="rounded-xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{reservation.walkerName}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <PawPrint className="w-3.5 h-3.5" />
                  {reservation.petName}
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

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="font-bold text-primary">
                {formatCurrency(reservation.totalPrice, locale)}
              </span>
              {isCompleted && reservation.summaryDistanceKm != null && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {reservation.summaryDistanceKm} km
                </span>
              )}
            </div>

            {isActive && onTrack && trackLabel && (
              <Button fullWidth size="md" className="mt-3" onClick={() => onTrack(reservation)}>
                <Navigation className="w-4 h-4" />
                {trackLabel}
              </Button>
            )}

            {isCompleted && reservation.completedAt && (
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(reservation.completedAt).toLocaleString(
                  locale === 'en' ? 'en-US' : 'es-CO',
                  { dateStyle: 'medium', timeStyle: 'short' }
                )}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
