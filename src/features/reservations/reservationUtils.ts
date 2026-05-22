import type { Reservation, ReservationStatus } from '@/types';

export function parseScheduledAt(reservation: Reservation): Date {
  const [year, month, day] = reservation.scheduledDate.split('-').map(Number);
  const [hours, minutes] = reservation.scheduledTime.split(':').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, hours ?? 0, minutes ?? 0, 0, 0);
}

export function getReservationEndAt(reservation: Reservation): Date {
  const start = parseScheduledAt(reservation);
  return new Date(start.getTime() + reservation.durationMinutes * 60_000);
}

/** Effective status based on persisted status + scheduled window. */
export function resolveEffectiveStatus(
  reservation: Reservation,
  now = new Date()
): ReservationStatus {
  if (reservation.status === 'cancelled') return 'cancelled';
  if (reservation.status === 'completed') return 'completed';

  const start = parseScheduledAt(reservation);
  const end = getReservationEndAt(reservation);

  if (reservation.status === 'active') {
    return now >= end ? 'completed' : 'active';
  }

  if (now >= end) return 'completed';
  if (now >= start) return 'active';
  return 'scheduled';
}

export function getWalkProgress(reservation: Reservation, now = new Date()): number {
  const effective = resolveEffectiveStatus(reservation, now);
  if (effective !== 'active') return effective === 'completed' ? 100 : 0;

  const start = reservation.startedAt
    ? new Date(reservation.startedAt)
    : parseScheduledAt(reservation);
  const end = getReservationEndAt(reservation);
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 0;

  const elapsed = now.getTime() - start.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function getElapsedWalkSeconds(reservation: Reservation, now = new Date()): number {
  const effective = resolveEffectiveStatus(reservation, now);
  if (effective === 'scheduled') return 0;

  const start = reservation.startedAt
    ? new Date(reservation.startedAt)
    : parseScheduledAt(reservation);
  const end =
    effective === 'completed' && reservation.completedAt
      ? new Date(reservation.completedAt)
      : now;

  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
}

export function getMinutesUntilStart(reservation: Reservation, now = new Date()): number {
  const start = parseScheduledAt(reservation);
  return Math.max(0, Math.ceil((start.getTime() - now.getTime()) / 60_000));
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

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function calculateBookingTotals(walkerPrice: number, durationMinutes: number) {
  const multiplier = durationMinutes === 30 ? 0.6 : durationMinutes === 90 ? 1.4 : 1;
  const servicePrice = Math.round(walkerPrice * multiplier);
  const platformFee = Math.round(servicePrice * 0.15);
  const insuranceFee = Math.round(servicePrice * 0.05);
  const totalPrice = servicePrice + platformFee + insuranceFee;
  return { servicePrice, platformFee, insuranceFee, totalPrice };
}
