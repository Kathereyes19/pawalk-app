import {
  isScheduledInFuture,
  parseScheduledDateTime,
  type BookingDateOption,
} from '@/lib/bookingDates';
import {
  filterDatesForWalker,
  filterTimeSlotsForWalker,
  getSuggestedBookingSlot,
  getWalkerEarliestBookable,
  getWalkerAvailabilityValidationMessage,
  isBeforeWalkerAvailability,
  type BookingTimeSlot,
} from '@/lib/walkers/availability';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import type { BookingData, HomeServiceCategory, Walker } from '@/types';

const VET_OPEN_HOUR = 8;
const VET_CLOSE_HOUR = 18;
const OVERNIGHT_START_HOUR = 12;

export interface BookingAvailabilityResult {
  valid: boolean;
  message: string;
}

function parseHour(time: string): number {
  return Number(time.split(':')[0] ?? 0);
}

function isVetBusinessDay(dateKey: string): boolean {
  const day = new Date(`${dateKey}T12:00:00`).getDay();
  return day !== 0;
}

function isWithinVetBusinessHours(time: string): boolean {
  const hour = parseHour(time);
  return hour >= VET_OPEN_HOUR && hour < VET_CLOSE_HOUR;
}

function isBeforeEarliestProviderSlot(
  dateKey: string,
  time: string,
  provider: Walker,
  now = new Date()
): boolean {
  if (provider.available) return false;

  const earliest = getWalkerEarliestBookable(provider);
  if (!earliest) return false;

  const slotTime = parseScheduledDateTime(dateKey, time).getTime();
  const earliestTime = parseScheduledDateTime(earliest.date, earliest.time).getTime();
  if (slotTime < earliestTime) return true;

  return slotTime <= now.getTime();
}

function isOvernightCareBooking(bookingData?: Pick<BookingData, 'isOvernight' | 'duration'>): boolean {
  if (bookingData?.isOvernight) return true;
  return (bookingData?.duration ?? 0) >= 1440;
}

function isBeforeCaregiverAvailability(
  dateKey: string,
  time: string,
  provider: Walker,
  bookingData?: Pick<BookingData, 'isOvernight' | 'duration'>,
  now = new Date()
): boolean {
  if (isBeforeEarliestProviderSlot(dateKey, time, provider, now)) {
    return true;
  }

  if (isOvernightCareBooking(bookingData) && parseHour(time) < OVERNIGHT_START_HOUR) {
    return true;
  }

  return false;
}

function isBeforeVetAvailability(
  dateKey: string,
  time: string,
  provider: Walker,
  now = new Date()
): boolean {
  if (!isVetBusinessDay(dateKey)) return true;
  if (!isWithinVetBusinessHours(time)) return true;
  return isBeforeEarliestProviderSlot(dateKey, time, provider, now);
}

export function resolveBookingCategory(
  provider: Walker,
  bookingData?: Pick<BookingData, 'serviceCategory'>
): HomeServiceCategory {
  return bookingData?.serviceCategory ?? getWalkerHomeCategory(provider);
}

export function isBookingBeforeProviderAvailability(
  category: HomeServiceCategory,
  dateKey: string,
  time: string,
  provider: Walker,
  bookingData?: Pick<BookingData, 'isOvernight' | 'duration'>,
  now = new Date()
): boolean {
  if (!dateKey || !time) return true;

  if (!isScheduledInFuture(dateKey, time, now)) {
    return true;
  }

  switch (category) {
    case 'walkers':
      return isBeforeWalkerAvailability(dateKey, time, provider, now);
    case 'caregivers':
      return isBeforeCaregiverAvailability(dateKey, time, provider, bookingData, now);
    case 'veterinary':
      return isBeforeVetAvailability(dateKey, time, provider, now);
    default:
      return isBeforeWalkerAvailability(dateKey, time, provider, now);
  }
}

export function getBookingAvailabilityValidationMessage(
  category: HomeServiceCategory,
  provider: Walker,
  bookingData?: Pick<BookingData, 'isOvernight' | 'duration'>,
  locale: 'es' | 'en' = 'es'
): string {
  if (category === 'walkers') {
    return getWalkerAvailabilityValidationMessage(provider, locale);
  }

  if (category === 'caregivers') {
    if (isOvernightCareBooking(bookingData)) {
      return locale === 'en'
        ? 'Overnight care starts at 12:00 PM or later on an available date.'
        : 'El cuidado nocturno inicia a las 12:00 PM o en un horario posterior disponible.';
    }
    const label = getWalkerAvailabilityValidationMessage(provider, locale);
    return label.replace('paseador', 'cuidador').replace('walker', 'caregiver');
  }

  if (locale === 'en') {
    return 'Choose a future appointment between 8:00 AM and 6:00 PM, Monday through Saturday.';
  }
  return 'Selecciona una cita futura entre 8:00 AM y 6:00 PM, de lunes a sábado.';
}

export function validateBookingAvailability(
  category: HomeServiceCategory,
  dateKey: string,
  time: string,
  provider: Walker,
  bookingData?: Pick<BookingData, 'isOvernight' | 'duration'>,
  now = new Date()
): BookingAvailabilityResult {
  if (!dateKey || !time) {
    return {
      valid: false,
      message: 'Selecciona una fecha y hora para continuar.',
    };
  }

  if (!isScheduledInFuture(dateKey, time, now)) {
    return {
      valid: false,
      message: 'La fecha y hora seleccionadas deben ser futuras.',
    };
  }

  if (isBookingBeforeProviderAvailability(category, dateKey, time, provider, bookingData, now)) {
    return {
      valid: false,
      message: getBookingAvailabilityValidationMessage(category, provider, bookingData),
    };
  }

  return { valid: true, message: '' };
}

function filterTimeSlotsForCaregiver(
  dateKey: string,
  slots: BookingTimeSlot[],
  provider: Walker,
  bookingData?: Pick<BookingData, 'isOvernight' | 'duration'>,
  now = new Date()
): BookingTimeSlot[] {
  const base = filterTimeSlotsForWalker(dateKey, slots, provider, now);

  if (!isOvernightCareBooking(bookingData)) {
    return base;
  }

  return base.map((slot) => ({
    ...slot,
    available: slot.available && parseHour(slot.time) >= OVERNIGHT_START_HOUR,
  }));
}

function filterTimeSlotsForVet(
  dateKey: string,
  slots: BookingTimeSlot[],
  provider: Walker,
  now = new Date()
): BookingTimeSlot[] {
  if (!isVetBusinessDay(dateKey)) {
    return slots.map((slot) => ({ ...slot, available: false }));
  }

  return slots.map((slot) => ({
    ...slot,
    available:
      slot.available &&
      isWithinVetBusinessHours(slot.time) &&
      !isBeforeVetAvailability(dateKey, slot.time, provider, now),
  }));
}

export function filterTimeSlotsForProvider(
  category: HomeServiceCategory,
  dateKey: string,
  slots: BookingTimeSlot[],
  provider: Walker,
  bookingData?: Pick<BookingData, 'isOvernight' | 'duration'>,
  now = new Date()
): BookingTimeSlot[] {
  switch (category) {
    case 'walkers':
      return filterTimeSlotsForWalker(dateKey, slots, provider, now);
    case 'caregivers':
      return filterTimeSlotsForCaregiver(dateKey, slots, provider, bookingData, now);
    case 'veterinary':
      return filterTimeSlotsForVet(dateKey, slots, provider, now);
    default:
      return filterTimeSlotsForWalker(dateKey, slots, provider, now);
  }
}

function filterDatesForCaregiver(
  dates: BookingDateOption[],
  provider: Walker,
  baseTimeSlots: BookingTimeSlot[],
  bookingData?: Pick<BookingData, 'isOvernight' | 'duration'>,
  now = new Date()
): BookingDateOption[] {
  return dates.map((dateOption) => {
    const slots = filterTimeSlotsForCaregiver(
      dateOption.date,
      baseTimeSlots,
      provider,
      bookingData,
      now
    );
    const hasBookableSlot = slots.some((slot) => slot.available);
    return {
      ...dateOption,
      available: dateOption.available && hasBookableSlot,
    };
  });
}

function filterDatesForVet(
  dates: BookingDateOption[],
  provider: Walker,
  baseTimeSlots: BookingTimeSlot[],
  now = new Date()
): BookingDateOption[] {
  return dates.map((dateOption) => {
    const slots = filterTimeSlotsForVet(dateOption.date, baseTimeSlots, provider, now);
    const hasBookableSlot = slots.some((slot) => slot.available);
    return {
      ...dateOption,
      available: dateOption.available && hasBookableSlot && isVetBusinessDay(dateOption.date),
    };
  });
}

export function filterDatesForProvider(
  category: HomeServiceCategory,
  dates: BookingDateOption[],
  provider: Walker,
  baseTimeSlots: BookingTimeSlot[],
  bookingData?: Pick<BookingData, 'isOvernight' | 'duration'>,
  now = new Date()
): BookingDateOption[] {
  switch (category) {
    case 'walkers':
      return filterDatesForWalker(dates, provider, baseTimeSlots, now);
    case 'caregivers':
      return filterDatesForCaregiver(dates, provider, baseTimeSlots, bookingData, now);
    case 'veterinary':
      return filterDatesForVet(dates, provider, baseTimeSlots, now);
    default:
      return filterDatesForWalker(dates, provider, baseTimeSlots, now);
  }
}

export function getSuggestedProviderBookingSlot(
  category: HomeServiceCategory,
  provider: Walker,
  bookingData?: Pick<BookingData, 'isOvernight' | 'duration'>
): { date: string; time: string } | null {
  const suggested = getSuggestedBookingSlot(provider);
  if (!suggested) return null;

  if (
    category === 'caregivers' &&
    isOvernightCareBooking(bookingData) &&
    parseHour(suggested.time) < OVERNIGHT_START_HOUR
  ) {
    return { ...suggested, time: '14:00' };
  }

  if (category === 'veterinary') {
    if (!isVetBusinessDay(suggested.date) || !isWithinVetBusinessHours(suggested.time)) {
      return { date: suggested.date, time: '10:00' };
    }
  }

  return suggested;
}
