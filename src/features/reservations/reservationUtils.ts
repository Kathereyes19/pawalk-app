import type { Reservation, ReservationStatus } from '@/types';

export function parseScheduledAt(reservation: Reservation): Date {
  const [year, month, day] = reservation.scheduledDate.split('-').map(Number);
  const [hours, minutes] = reservation.scheduledTime.split(':').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, hours ?? 0, minutes ?? 0, 0, 0);
}

export function resolveEffectiveStatus(
  reservation: Reservation,
  now = new Date()
): ReservationStatus {
  if (reservation.status === 'cancelled') return 'cancelled';
  if (reservation.status === 'completed') return 'completed';
  if (reservation.status === 'active') return 'active';

  const start = parseScheduledAt(reservation);
  const end = new Date(start.getTime() + reservation.durationMinutes * 60_000);

  if (now >= end) return 'completed';
  if (now >= start) return 'active';
  return 'scheduled';
}

export function formatReservationDate(date: string, locale: 'es' | 'en'): string {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatReservationTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = Number(hours);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 || 12;
  return `${normalized}:${minutes ?? '00'} ${suffix}`;
}

export function formatCurrency(amount: number, locale: 'es' | 'en'): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateBookingTotals(walkerPrice: number, durationMinutes: number) {
  const multiplier = durationMinutes === 30 ? 0.6 : durationMinutes === 90 ? 1.4 : 1;
  const servicePrice = Math.round(walkerPrice * multiplier);
  const platformFee = Math.round(servicePrice * 0.15);
  const insuranceFee = Math.round(servicePrice * 0.05);
  const totalPrice = servicePrice + platformFee + insuranceFee;
  return { servicePrice, platformFee, insuranceFee, totalPrice };
}
