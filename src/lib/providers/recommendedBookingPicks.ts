import { toDateKey } from '@/lib/bookingDates';
import { canBookImmediately } from '@/lib/walkers/availability';
import {
  filterTimeSlotsForProvider,
  getSuggestedProviderBookingSlot,
} from '@/lib/providers/bookingAvailability';
import type { BookingData, HomeServiceCategory, Walker } from '@/types';

export interface BookingTimeSlotOption {
  time: string;
  available: boolean;
  popular: boolean;
}

export interface RecommendedBookingPick {
  id: string;
  label: string;
  hint?: string;
  date: string;
  time: string;
  accent: 'now' | 'popular' | 'suggested';
}

function formatTime12h(time: string): string {
  const [hours, minutes = '00'] = time.split(':');
  const hour = Number(hours);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 || 12;
  return `${normalized}:${minutes} ${suffix}`;
}

function getRelativeDayLabel(dateKey: string, locale: 'es' | 'en' = 'es'): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateKey}T12:00:00`);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return locale === 'en' ? 'Today' : 'Hoy';
  if (diffDays === 1) return locale === 'en' ? 'Tomorrow' : 'Mañana';

  return target.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', {
    weekday: 'short',
  });
}

function findBestSlot(
  category: HomeServiceCategory,
  dateKey: string,
  baseTimeSlots: BookingTimeSlotOption[],
  walker: Walker,
  availabilityContext: Pick<BookingData, 'isOvernight' | 'duration'> | undefined,
  now: Date
) {
  const slots = filterTimeSlotsForProvider(
    category,
    dateKey,
    baseTimeSlots,
    walker,
    availabilityContext,
    now
  );
  return slots.find((slot) => slot.available && slot.popular) ?? slots.find((slot) => slot.available) ?? null;
}

export function getRecommendedBookingQuickPicks(
  category: HomeServiceCategory,
  walker: Walker,
  baseTimeSlots: BookingTimeSlotOption[],
  availabilityContext?: Pick<BookingData, 'isOvernight' | 'duration'>,
  locale: 'es' | 'en' = 'es',
  now = new Date()
): RecommendedBookingPick[] {
  const picks: RecommendedBookingPick[] = [];
  const seen = new Set<string>();
  const todayKey = toDateKey(now);
  const tomorrowKey = toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));

  const addPick = (pick: RecommendedBookingPick) => {
    const key = `${pick.date}|${pick.time}`;
    if (seen.has(key)) return;
    seen.add(key);
    picks.push(pick);
  };

  if (canBookImmediately(walker)) {
    const nowSlot = findBestSlot(category, todayKey, baseTimeSlots, walker, availabilityContext, now);
    if (nowSlot) {
      addPick({
        id: 'available-now',
        label: locale === 'en' ? 'Available now' : 'Disponible ahora',
        hint: formatTime12h(nowSlot.time),
        date: todayKey,
        time: nowSlot.time,
        accent: 'now',
      });
    }
  }

  const todaySlot = findBestSlot(category, todayKey, baseTimeSlots, walker, availabilityContext, now);
  if (todaySlot) {
    addPick({
      id: 'today-slot',
      label: `${getRelativeDayLabel(todayKey, locale)} ${formatTime12h(todaySlot.time)}`,
      hint: todaySlot.popular ? (locale === 'en' ? 'Popular' : 'Popular') : undefined,
      date: todayKey,
      time: todaySlot.time,
      accent: todaySlot.popular ? 'popular' : 'suggested',
    });
  }

  const tomorrowSlot = findBestSlot(category, tomorrowKey, baseTimeSlots, walker, availabilityContext, now);
  if (tomorrowSlot) {
    addPick({
      id: 'tomorrow-slot',
      label: `${getRelativeDayLabel(tomorrowKey, locale)} ${formatTime12h(tomorrowSlot.time)}`,
      hint: tomorrowSlot.popular ? (locale === 'en' ? 'Popular' : 'Popular') : undefined,
      date: tomorrowKey,
      time: tomorrowSlot.time,
      accent: tomorrowSlot.popular ? 'popular' : 'suggested',
    });
  }

  const suggested = getSuggestedProviderBookingSlot(category, walker, availabilityContext);
  if (suggested) {
    const slots = filterTimeSlotsForProvider(
      category,
      suggested.date,
      baseTimeSlots,
      walker,
      availabilityContext,
      now
    );
    const isValid = slots.some((slot) => slot.time === suggested.time && slot.available);
    if (isValid) {
      addPick({
        id: 'provider-suggested',
        label: `${getRelativeDayLabel(suggested.date, locale)} ${formatTime12h(suggested.time)}`,
        hint: locale === 'en' ? 'Recommended' : 'Recomendado',
        date: suggested.date,
        time: suggested.time,
        accent: 'suggested',
      });
    }
  }

  return picks.slice(0, 4);
}
