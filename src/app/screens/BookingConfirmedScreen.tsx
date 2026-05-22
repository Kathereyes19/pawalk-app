import React from 'react';
import { Calendar, Clock, MapPin, Sparkles, CalendarDays, PawPrint } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatReservationDate, formatReservationTime, formatCurrency } from '@/features/reservations';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import { getWalkerAvatarProps } from '@/lib/images';
import {
  formatCareDurationLabel,
  getCategoryBadgeLabel,
} from '@/lib/providers/serviceExperience';
import { OrderConfirmedLayout } from '../components/checkout';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import type { Walker, BookingData } from '@/types';

interface BookingConfirmedScreenProps {
  walker: Walker;
  bookingData: BookingData;
  onViewReservations: () => void;
  onBackHome: () => void;
}

export const BookingConfirmedScreen: React.FC<BookingConfirmedScreenProps> = ({
  walker,
  bookingData,
  onViewReservations,
  onBackHome,
}) => {
  const { t, language } = useLanguage();
  const category = bookingData.serviceCategory ?? getWalkerHomeCategory(walker);
  const durationLabel =
    bookingData.durationLabel ??
    formatCareDurationLabel(bookingData.duration ?? 60, bookingData.isOvernight);

  const providerSubtitle =
    category === 'veterinary'
      ? 'Centro de servicios'
      : category === 'caregivers'
        ? 'Cuidador confirmado'
        : t('booking.confirmed.walker');

  const noteCopy =
    category === 'walkers'
      ? 'Podrás seguir el paseo en vivo cuando comience.'
      : category === 'caregivers'
        ? 'Recibirás actualizaciones durante el periodo de cuidado.'
        : 'Presenta esta confirmación en recepción el día de tu cita.';

  const confirmedTitle =
    category === 'caregivers'
      ? '¡Cuidado reservado!'
      : category === 'veterinary'
        ? '¡Cita confirmada!'
        : t('booking.confirmed.title');

  const confirmedSubtitle =
    category === 'caregivers'
      ? 'Tu reserva de cuidado quedó registrada correctamente.'
      : category === 'veterinary'
        ? 'Tu cita en el centro de servicios fue confirmada.'
        : t('booking.confirmed.subtitle');

  return (
    <OrderConfirmedLayout
      title={confirmedTitle}
      subtitle={confirmedSubtitle}
      badge={getCategoryBadgeLabel(category)}
      hint={t('booking.confirmed.hint')}
      primaryAction={{
        label: t('booking.confirmed.viewReservations'),
        onClick: onViewReservations,
        icon: <CalendarDays className="w-5 h-5" />,
      }}
      secondaryAction={{
        label: t('booking.confirmed.backHome'),
        onClick: onBackHome,
        variant: 'outline',
      }}
    >
      <Card variant="elevated" className="shadow-2xl border-2 border-primary/10 bg-gradient-to-br from-card to-primary/5">
        <div className="flex items-center gap-4 pb-4 border-b-2 border-border/50">
          <Avatar {...getWalkerAvatarProps(walker)} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{walker.name}</h3>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{providerSubtitle}</p>
          </div>
        </div>

        <div className="space-y-4 pt-5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">{t('booking.confirmed.date')}</p>
              <p className="font-semibold">
                {bookingData.date
                  ? formatReservationDate(bookingData.date, language)
                  : bookingData.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">{t('booking.confirmed.time')}</p>
              <p className="font-semibold">
                {bookingData.time ? formatReservationTime(bookingData.time) : bookingData.time} ·{' '}
                {durationLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-info/5 border border-info/10">
            <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-info" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">{t('booking.confirmed.note')}</p>
              <p className="text-sm font-medium">{noteCopy}</p>
            </div>
          </div>

          {bookingData.pets && bookingData.pets.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <PawPrint className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Mascotas</p>
                <p className="font-semibold">{bookingData.pets.map((pet) => pet.name).join(', ')}</p>
              </div>
            </div>
          )}

          {bookingData.total != null && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
              <span className="text-sm font-medium">Total pagado</span>
              <span className="font-bold text-primary text-lg">
                {formatCurrency(bookingData.total, language)}
              </span>
            </div>
          )}
        </div>
      </Card>
    </OrderConfirmedLayout>
  );
};
