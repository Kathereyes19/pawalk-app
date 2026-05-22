import {
  buildUpcomingBookingDates,
  filterAvailableTimeSlots,
  parseScheduledDateTime,
  toDateKey,
  type BookingDateOption,
} from '@/lib/bookingDates';
import type { Walker } from '@/types';

export interface BookingTimeSlot {
  time: string;
  available: boolean;
  popular: boolean;
}

export function formatNextAvailableLabel(
  walker: Walker,
  locale: 'es' | 'en' = 'es'
): string | null {
  if (walker.available) return null;
  if (!walker.nextAvailableDate || !walker.nextAvailableTime) {
    return locale === 'en' ? 'Schedule for later' : 'Agendar más tarde';
  }

  const date = new Date(`${walker.nextAvailableDate}T12:00:00`);
  const dateLabel = date.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const [hours, minutes] = walker.nextAvailableTime.split(':');
  const hour = Number(hours);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 || 12;
  const timeLabel = `${normalized}:${minutes ?? '00'} ${suffix}`;

  if (locale === 'en') {
    return `Next: ${dateLabel} · ${timeLabel}`;
  }
  return `Próximo: ${dateLabel} · ${timeLabel}`;
}

export function canBookImmediately(walker: Walker): boolean {
  return walker.available;
}

export function getWalkerEarliestBookable(
  walker: Walker
): { date: string; time: string } | null {
  if (walker.available) return null;
  if (walker.nextAvailableDate && walker.nextAvailableTime) {
    return {
      date: walker.nextAvailableDate,
      time: walker.nextAvailableTime,
    };
  }
  return getSuggestedBookingSlot(walker);
}

export function isBeforeWalkerAvailability(
  dateKey: string,
  time: string,
  walker: Walker,
  now = new Date()
): boolean {
  if (walker.available) return false;

  const earliest = getWalkerEarliestBookable(walker);
  if (!earliest) return false;

  const slotTime = parseScheduledDateTime(dateKey, time).getTime();
  const earliestTime = parseScheduledDateTime(earliest.date, earliest.time).getTime();
  if (slotTime < earliestTime) return true;

  return slotTime <= now.getTime();
}

export function filterTimeSlotsForWalker(
  dateKey: string,
  slots: BookingTimeSlot[],
  walker: Walker,
  now = new Date()
): BookingTimeSlot[] {
  const futureSlots = filterAvailableTimeSlots(dateKey, slots, now);
  if (walker.available) return futureSlots;

  return futureSlots.map((slot) => ({
    ...slot,
    available: slot.available && !isBeforeWalkerAvailability(dateKey, slot.time, walker, now),
  }));
}

export function filterDatesForWalker(
  dates: BookingDateOption[],
  walker: Walker,
  baseTimeSlots: BookingTimeSlot[],
  now = new Date()
): BookingDateOption[] {
  return dates.map((dateOption) => {
    const slots = filterTimeSlotsForWalker(dateOption.date, baseTimeSlots, walker, now);
    const hasBookableSlot = slots.some((slot) => slot.available);
    return {
      ...dateOption,
      available: dateOption.available && hasBookableSlot,
    };
  });
}

export function getFirstBookableDate(
  walker: Walker,
  baseTimeSlots: BookingTimeSlot[],
  count = 7,
  now = new Date()
): BookingDateOption | null {
  const dates = filterDatesForWalker(buildUpcomingBookingDates(count), walker, baseTimeSlots, now);
  return dates.find((entry) => entry.available) ?? null;
}

export function getWalkerAvailabilityValidationMessage(walker: Walker, locale: 'es' | 'en' = 'es'): string {
  const label = formatNextAvailableLabel(walker, locale);
  if (locale === 'en') {
    return label
      ? `Choose ${label.replace('Next: ', '')} or later.`
      : 'Choose a future time when this walker is available.';
  }
  return label
    ? `Selecciona ${label.replace('Próximo: ', '')} o un horario posterior.`
    : 'Selecciona un horario futuro cuando el paseador esté disponible.';
}

export function getSuggestedBookingSlot(walker: Walker): {
  date: string;
  time: string;
} | null {
  if (walker.available) return null;
  if (walker.nextAvailableDate && walker.nextAvailableTime) {
    return {
      date: walker.nextAvailableDate,
      time: walker.nextAvailableTime,
    };
  }

  const dates = buildUpcomingBookingDates(7);
  const fallback = dates[1] ?? dates[0];
  if (!fallback) return null;

  return { date: fallback.date, time: '10:00' };
}

export function isWalkerVisibleOnMap(walker: Walker): boolean {
  return true;
}

export function todayDateKey(): string {
  return toDateKey(new Date());
}

/** Tomorrow's date key in local time */
export function tomorrowDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateKey(d);
}

export function dayAfterTomorrowDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return toDateKey(d);
}
