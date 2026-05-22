import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Calendar, Clock, MapPin, Sparkles, CalendarDays, PawPrint } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatReservationDate, formatReservationTime, formatCurrency } from '@/features/reservations';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import {
  formatCareDurationLabel,
  getCategoryBadgeLabel,
} from '@/lib/providers/serviceExperience';
import { Button } from '../components/Button';
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

  return (
    <div className="h-full overflow-y-auto pb-24 p-4 flex flex-col items-center justify-center bg-gradient-to-b from-success/5 via-background to-background">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        className="mb-8 relative"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-4 border-success/30"
            animate={{ scale: [1, 2], opacity: [0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
            style={{
              width: '112px',
              height: '112px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        <div className="w-28 h-28 bg-gradient-to-br from-success via-success/90 to-success/80 rounded-full flex items-center justify-center relative z-10">
          <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8 px-4"
      >
        <h1 className="text-3xl font-bold mb-3">{t('booking.confirmed.title')}</h1>
        <p className="text-foreground-secondary text-lg">{t('booking.confirmed.subtitle')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md mb-6 px-4"
      >
        <Card variant="elevated" className="shadow-2xl border-2 border-primary/10 bg-gradient-to-br from-card to-primary/5">
          <div className="flex items-center gap-4 pb-4 border-b-2 border-border/50">
            <Avatar emoji={walker.avatar} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{walker.name}</h3>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{providerSubtitle}</p>
              {category === 'veterinary' && bookingData.selectedServiceName && (
                <p className="text-xs text-primary font-medium mt-1">
                  {getCategoryBadgeLabel(category)} · {bookingData.selectedServiceName}
                </p>
              )}
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

            {category === 'caregivers' && bookingData.careInstructions && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <PawPrint className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Instrucciones de cuidado</p>
                  <p className="text-sm">{bookingData.careInstructions}</p>
                </div>
              </div>
            )}

            {category === 'veterinary' && bookingData.institutionAddress && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-info" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Ubicación</p>
                  <p className="text-sm">{bookingData.institutionAddress}</p>
                </div>
              </div>
            )}

            {bookingData.pets && bookingData.pets.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <PawPrint className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Mascotas</p>
                  <p className="font-semibold">
                    {bookingData.pets.map((pet) => pet.name).join(', ')}
                  </p>
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-md space-y-3 px-4"
      >
        <Button fullWidth size="xl" onClick={onViewReservations}>
          <CalendarDays className="w-5 h-5" />
          {t('booking.confirmed.viewReservations')}
        </Button>
        <Button fullWidth size="lg" variant="outline" onClick={onBackHome}>
          {t('booking.confirmed.backHome')}
        </Button>
        <p className="text-center text-sm text-muted-foreground pt-2">
          {t('booking.confirmed.hint')}
        </p>
      </motion.div>
    </div>
  );
};
