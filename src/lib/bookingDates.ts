export interface BookingDateOption {
  date: string;
  label: string;
  day: string;
  month: string;
  available: boolean;
  popular: boolean;
}

const DAY_LABELS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_LABELS_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function buildUpcomingBookingDates(count = 7): BookingDateOption[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      date: toDateKey(date),
      label: DAY_LABELS_ES[date.getDay()],
      day: String(date.getDate()),
      month: MONTH_LABELS_ES[date.getMonth()],
      available: index !== count - 1,
      popular: index === 1 || index === 2,
    };
  });
}

export function isTimeSlotInFuture(dateKey: string, time: string, now = new Date()): boolean {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const slot = new Date(year, (month ?? 1) - 1, day ?? 1, hours ?? 0, minutes ?? 0, 0, 0);
  return slot.getTime() > now.getTime();
}

export function filterAvailableTimeSlots(
  dateKey: string,
  slots: { time: string; available: boolean; popular: boolean }[],
  now = new Date()
): { time: string; available: boolean; popular: boolean }[] {
  return slots.map((slot) => ({
    ...slot,
    available: slot.available && isTimeSlotInFuture(dateKey, slot.time, now),
  }));
}

export function parseScheduledDateTime(dateKey: string, time: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, hours ?? 0, minutes ?? 0, 0, 0);
}

export function isScheduledInFuture(dateKey: string, time: string, now = new Date()): boolean {
  return parseScheduledDateTime(dateKey, time).getTime() > now.getTime();
}
