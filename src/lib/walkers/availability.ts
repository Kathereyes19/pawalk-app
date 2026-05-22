import { buildUpcomingBookingDates, toDateKey } from '@/lib/bookingDates';
import type { Walker } from '@/types';

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
