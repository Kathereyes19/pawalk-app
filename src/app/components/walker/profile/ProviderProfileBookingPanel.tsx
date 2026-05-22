import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, DollarSign, Sparkles, Zap } from 'lucide-react';
import { Button } from '../../Button';
import { Badge } from '../../Badge';
import { Card } from '../../Card';
import { WalkerAvailabilityBadge } from '../WalkerAvailabilityBadge';
import { buildUpcomingBookingDates } from '@/lib/bookingDates';
import {
  filterDatesForProvider,
  filterTimeSlotsForProvider,
  getSuggestedProviderBookingSlot,
} from '@/lib/providers/bookingAvailability';
import { getRecommendedBookingQuickPicks } from '@/lib/providers/recommendedBookingPicks';
import { canBookImmediately } from '@/lib/walkers/availability';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import {
  getPriceUnitLabel,
  getProfileBookCta,
} from '@/lib/providers/serviceExperience';
import { cn } from '../../../utils/cn';
import {
  PROFILE_CHIP_BASE,
  PROFILE_CHIP_DEFAULT,
  PROFILE_CHIP_DISABLED,
  PROFILE_CHIP_SELECTED,
  PROFILE_DATE_CARD_BASE,
  PROFILE_DATE_CARD_DEFAULT,
  PROFILE_DATE_CARD_SELECTED,
  PROFILE_SLOT_BASE,
  PROFILE_SLOT_DEFAULT,
  PROFILE_SLOT_SELECTED,
} from './profileButtonStyles';
import type { Walker } from '@/types';

interface ProviderProfileBookingPanelProps {
  walker: Walker;
  onBookWalk: () => void;
}

const BASE_TIME_SLOTS = [
  { time: '08:00', available: true, popular: false },
  { time: '09:00', available: true, popular: true },
  { time: '10:00', available: true, popular: true },
  { time: '11:00', available: true, popular: false },
  { time: '14:00', available: true, popular: false },
  { time: '15:00', available: true, popular: false },
  { time: '16:00', available: true, popular: true },
  { time: '17:00', available: true, popular: false },
  { time: '18:00', available: true, popular: true },
];

export const ProviderProfileBookingPanel: React.FC<ProviderProfileBookingPanelProps> = ({
  walker,
  onBookWalk,
}) => {
  const category = getWalkerHomeCategory(walker);
  const instantBooking = canBookImmediately(walker);
  const bookCta = getProfileBookCta(category);
  const priceUnit = getPriceUnitLabel(category);

  const availabilityContext = useMemo(
    () => ({
      isOvernight: false,
      duration: category === 'veterinary' ? 45 : 60,
    }),
    [category]
  );

  const suggestedSlot = useMemo(
    () => getSuggestedProviderBookingSlot(category, walker, availabilityContext),
    [category, walker, availabilityContext]
  );

  const availableDates = useMemo(
    () =>
      filterDatesForProvider(
        category,
        buildUpcomingBookingDates(7),
        walker,
        BASE_TIME_SLOTS,
        availabilityContext
      ),
    [category, walker, availabilityContext]
  );

  const recommendedPicks = useMemo(
    () =>
      getRecommendedBookingQuickPicks(
        category,
        walker,
        BASE_TIME_SLOTS,
        availabilityContext,
        'es'
      ),
    [category, walker, availabilityContext]
  );

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    if (selectedDate) return;

    const firstRecommended = recommendedPicks[0];
    if (firstRecommended) {
      setSelectedDate(firstRecommended.date);
      setSelectedTime(firstRecommended.time);
      return;
    }

    if (!instantBooking && suggestedSlot?.date) {
      setSelectedDate(suggestedSlot.date);
      if (suggestedSlot.time) {
        setSelectedTime(suggestedSlot.time);
      }
      return;
    }

    const firstAvailable = availableDates.find((entry) => entry.available);
    if (firstAvailable) {
      setSelectedDate(firstAvailable.date);
    }
  }, [availableDates, selectedDate, instantBooking, suggestedSlot, recommendedPicks]);

  const effectiveDate = selectedDate || availableDates.find((d) => d.available)?.date || '';

  const timeSlots = useMemo(
    () =>
      filterTimeSlotsForProvider(
        category,
        effectiveDate,
        BASE_TIME_SLOTS,
        walker,
        availabilityContext
      ),
    [category, effectiveDate, walker, availabilityContext]
  );

  useEffect(() => {
    if (!selectedDate || !selectedTime) return;
    const slotStillValid = timeSlots.some(
      (slot) => slot.time === selectedTime && slot.available
    );
    if (!slotStillValid) {
      setSelectedTime('');
    }
  }, [selectedDate, selectedTime, timeSlots]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleRecommendedPick = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const isRecommendedSelected = (date: string, time: string) =>
    effectiveDate === date && selectedTime === time;

  return (
    <aside
      className="sticky top-4 self-start"
      aria-label="Panel de reserva"
    >
      <Card padding="none" className="overflow-hidden border-border shadow-lg">
        <div className="border-b border-border bg-gradient-to-br from-primary/5 to-accent/5 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Precio desde
          </p>
          <div className="flex items-baseline gap-1.5">
            <DollarSign className="h-5 w-5 text-primary" aria-hidden />
            <span className="text-3xl font-bold text-primary">
              {walker.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">{priceUnit}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            {instantBooking ? (
              <>
                <Zap className="h-4 w-4 text-accent" aria-hidden />
                <span>Reserva instantánea disponible</span>
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" aria-hidden />
                <span>Agendamiento con anticipación</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">Estado</h2>
              <WalkerAvailabilityBadge walker={walker} size="sm" />
            </div>
            {walker.available && walker.responseTime != null && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                Responde en ~{walker.responseTime} min
              </p>
            )}
          </div>

          {recommendedPicks.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" aria-hidden />
                Horarios recomendados
              </h2>
              <div className="flex flex-col gap-2" role="group" aria-label="Horarios recomendados">
                {recommendedPicks.map((pick) => {
                  const isSelected = isRecommendedSelected(pick.date, pick.time);
                  return (
                    <button
                      key={pick.id}
                      type="button"
                      onClick={() => handleRecommendedPick(pick.date, pick.time)}
                      aria-pressed={isSelected}
                      className={cn(
                        PROFILE_CHIP_BASE,
                        'flex w-full items-center justify-between gap-3 text-left',
                        isSelected ? PROFILE_CHIP_SELECTED : PROFILE_CHIP_DEFAULT
                      )}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{pick.label}</span>
                        {pick.hint && pick.accent === 'now' && (
                          <span className={cn('text-xs font-medium', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                            Desde las {pick.hint}
                          </span>
                        )}
                      </span>
                      {pick.hint && pick.accent !== 'now' && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'shrink-0 rounded-full text-[10px] font-bold uppercase tracking-wide',
                            pick.accent === 'suggested' && 'border-secondary/40 text-secondary',
                            pick.accent === 'popular' && 'border-accent/40 text-accent',
                            isSelected && 'border-primary-foreground/30 text-primary-foreground'
                          )}
                        >
                          {pick.hint}
                        </Badge>
                      )}
                      {pick.accent === 'now' && (
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                          <Zap className="h-4 w-4" aria-hidden />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Fecha</h2>
            <div
              className="grid grid-cols-4 gap-2"
              role="radiogroup"
              aria-label="Seleccionar fecha"
            >
              {availableDates.map((dateOption) => {
                const isSelected = effectiveDate === dateOption.date;
                const isDisabled = !dateOption.available;

                return (
                  <button
                    key={dateOption.date}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isDisabled}
                    onClick={() => handleDateSelect(dateOption.date)}
                    className={cn(
                      PROFILE_DATE_CARD_BASE,
                      isDisabled && PROFILE_CHIP_DISABLED,
                      isSelected ? PROFILE_DATE_CARD_SELECTED : PROFILE_DATE_CARD_DEFAULT,
                      !isSelected && !isDisabled && 'text-foreground'
                    )}
                  >
                    {dateOption.popular && dateOption.available && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary shadow-sm">
                        <Sparkles className="h-3 w-3 text-white" aria-hidden />
                      </span>
                    )}
                    <span className={cn('block text-[10px] font-medium uppercase', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                      {dateOption.label}
                    </span>
                    <span className="block text-base font-bold leading-tight">{dateOption.day}</span>
                    <span className={cn('block text-[10px]', isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      {dateOption.month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Horario</h2>
            <div
              className="grid grid-cols-3 gap-2"
              role="radiogroup"
              aria-label="Seleccionar horario"
            >
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isDisabled = !slot.available;

                return (
                  <button
                    key={slot.time}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isDisabled}
                    onClick={() => setSelectedTime(slot.time)}
                    className={cn(
                      PROFILE_SLOT_BASE,
                      isDisabled && PROFILE_CHIP_DISABLED,
                      isSelected ? PROFILE_SLOT_SELECTED : PROFILE_SLOT_DEFAULT
                    )}
                  >
                    {slot.popular && slot.available && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <Badge className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-white">
                          Popular
                        </Badge>
                      </span>
                    )}
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={onBookWalk}
            size="lg"
            fullWidth
            className="min-h-12 shadow-md"
          >
            <Calendar className="h-5 w-5" aria-hidden />
            {bookCta}
          </Button>

          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Sin cargo hasta confirmar. Puedes revisar mascotas y detalles en el siguiente paso.
          </p>
        </div>
      </Card>
    </aside>
  );
};
