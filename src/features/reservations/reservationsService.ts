import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import { ensureReservationId } from '@/lib/reservationId';
import {
  loadStoredReservations,
  saveStoredReservations,
} from '@/lib/reservationStorage';
import {
  calculateBookingTotals,
  parseScheduledAt,
  resolveEffectiveStatus,
} from './reservationUtils';
import type {
  BookingData,
  Reservation,
  ReservationRow,
  ReservationStatus,
  Walker,
} from '@/types';

function mapRowToReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    userId: row.user_id,
    walkerId: row.walker_id,
    walkerName: row.walker_name,
    walkerAvatar: row.walker_avatar ?? '🐕',
    petId: row.pet_id,
    petName: row.pet_name,
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time.length === 5 ? row.scheduled_time : row.scheduled_time.slice(0, 5),
    durationMinutes: row.duration_minutes,
    status: row.status,
    servicePrice: Number(row.service_price),
    platformFee: Number(row.platform_fee),
    insuranceFee: Number(row.insurance_fee),
    totalPrice: Number(row.total_price),
    paymentMethod: row.payment_method,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    summaryDistanceKm: row.summary_distance_km ? Number(row.summary_distance_km) : null,
    summaryDurationMinutes: row.summary_duration_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReservationToRow(reservation: Reservation): Omit<ReservationRow, 'created_at' | 'updated_at'> {
  return {
    id: reservation.id,
    user_id: reservation.userId,
    walker_id: reservation.walkerId,
    walker_name: reservation.walkerName,
    walker_avatar: reservation.walkerAvatar,
    pet_id: reservation.petId,
    pet_name: reservation.petName,
    scheduled_date: reservation.scheduledDate,
    scheduled_time: reservation.scheduledTime,
    duration_minutes: reservation.durationMinutes,
    status: reservation.status,
    service_price: reservation.servicePrice,
    platform_fee: reservation.platformFee,
    insurance_fee: reservation.insuranceFee,
    total_price: reservation.totalPrice,
    payment_method: reservation.paymentMethod ?? null,
    started_at: reservation.startedAt ?? null,
    completed_at: reservation.completedAt ?? null,
    summary_distance_km: reservation.summaryDistanceKm ?? null,
    summary_duration_minutes: reservation.summaryDurationMinutes ?? null,
  };
}

function applyAutoStatus(reservation: Reservation, now = new Date()): Reservation {
  const effective = resolveEffectiveStatus(reservation, now);
  if (effective === reservation.status) return reservation;

  const next: Reservation = { ...reservation, status: effective, updatedAt: now.toISOString() };

  if (effective === 'active' && !next.startedAt) {
    next.startedAt = now.toISOString();
  }

  if (effective === 'completed' && !next.completedAt) {
    next.completedAt = now.toISOString();
    next.summaryDurationMinutes = next.summaryDurationMinutes ?? next.durationMinutes;
    next.summaryDistanceKm = next.summaryDistanceKm ?? Number((1.8 + Math.random() * 1.5).toFixed(1));
  }

  return next;
}

function sortReservations(reservations: Reservation[]): Reservation[] {
  return [...reservations].sort((a, b) => {
    const aTime = parseScheduledAt(a).getTime();
    const bTime = parseScheduledAt(b).getTime();
    return bTime - aTime;
  });
}

async function persistMockReservations(userId: string, reservations: Reservation[]): Promise<void> {
  saveStoredReservations(userId, reservations);
}

async function syncReservationUpdates(
  userId: string,
  reservations: Reservation[],
  updated: Reservation[]
): Promise<Reservation[]> {
  if (!isSupabaseConfigured()) {
    await persistMockReservations(userId, updated);
    return updated;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    await persistMockReservations(userId, updated);
    return updated;
  }

  const changed = updated.filter((item, index) => item.status !== reservations[index]?.status);
  for (const reservation of changed) {
    await supabase
      .from('bookings')
      .update({
        status: reservation.status,
        started_at: reservation.startedAt,
        completed_at: reservation.completedAt,
        summary_distance_km: reservation.summaryDistanceKm,
        summary_duration_minutes: reservation.summaryDurationMinutes,
        updated_at: reservation.updatedAt ?? new Date().toISOString(),
      })
      .eq('id', reservation.id)
      .eq('user_id', userId);
  }

  return updated;
}

export async function fetchReservationsByUserId(
  userId: string
): Promise<{ reservations: Reservation[]; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    const stored = loadStoredReservations(userId).map((item) => applyAutoStatus(item));
    const synced = await syncReservationUpdates(userId, loadStoredReservations(userId), stored);
    return { reservations: sortReservations(synced), error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { reservations: [], error: null };
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_date', { ascending: false })
    .order('scheduled_time', { ascending: false });

  if (error) {
    return { reservations: [], error: new Error(error.message) };
  }

  const raw = (data as ReservationRow[]).map(mapRowToReservation);
  const withStatus = raw.map((item) => applyAutoStatus(item));
  const synced = await syncReservationUpdates(userId, raw, withStatus);
  return { reservations: sortReservations(synced), error: null };
}

export interface CreateReservationInput {
  walker: Walker;
  bookingData: BookingData;
  petId?: string | null;
  petName?: string;
  paymentMethod?: string;
}

export async function createReservation(
  userId: string,
  input: CreateReservationInput
): Promise<{ reservation: Reservation | null; error: Error | null }> {
  const durationMinutes = input.bookingData.duration ?? 60;
  const totals = calculateBookingTotals(input.walker.price, durationMinutes);
  const now = new Date().toISOString();

  const reservation: Reservation = {
    id: ensureReservationId(),
    userId,
    walkerId: input.walker.id,
    walkerName: input.walker.name,
    walkerAvatar: input.walker.avatar,
    petId: input.petId ?? null,
    petName: input.petName ?? input.bookingData.petName ?? 'Mascota',
    scheduledDate: input.bookingData.date ?? new Date().toISOString().slice(0, 10),
    scheduledTime: input.bookingData.time ?? '10:00',
    durationMinutes,
    status: 'scheduled',
    servicePrice: totals.servicePrice,
    platformFee: totals.platformFee,
    insuranceFee: totals.insuranceFee,
    totalPrice: totals.totalPrice,
    paymentMethod: input.paymentMethod ?? 'card',
    createdAt: now,
    updatedAt: now,
  };

  if (!isSupabaseConfigured()) {
    const existing = loadStoredReservations(userId);
    const next = [reservation, ...existing];
    saveStoredReservations(userId, next);
    return { reservation, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { reservation, error: null };
  }

  const row = mapReservationToRow(reservation);
  const { data, error } = await supabase.from('bookings').insert(row).select('*').single();

  if (error) {
    return { reservation: null, error: new Error(error.message) };
  }

  return { reservation: mapRowToReservation(data as ReservationRow), error: null };
}

export async function updateReservationStatus(
  userId: string,
  reservationId: string,
  status: ReservationStatus
): Promise<{ error: Error | null }> {
  const now = new Date().toISOString();
  const patch: Partial<Reservation> = { status, updatedAt: now };

  if (status === 'active') {
    patch.startedAt = now;
  }

  if (status === 'completed') {
    patch.completedAt = now;
  }

  if (!isSupabaseConfigured()) {
    const existing = loadStoredReservations(userId);
    const next = existing.map((item) =>
      item.id === reservationId ? { ...item, ...patch } : item
    );
    saveStoredReservations(userId, next);
    return { error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { error: null };

  const { error } = await supabase
    .from('bookings')
    .update({
      status,
      started_at: status === 'active' ? now : undefined,
      completed_at: status === 'completed' ? now : undefined,
      updated_at: now,
    })
    .eq('id', reservationId)
    .eq('user_id', userId);

  return { error: error ? new Error(error.message) : null };
}

export function reservationToWalker(reservation: Reservation): Walker {
  return {
    id: reservation.walkerId,
    name: reservation.walkerName,
    avatar: reservation.walkerAvatar,
    rating: 4.9,
    reviews: 128,
    distance: 1.2,
    price: reservation.servicePrice,
    verified: true,
    experience: 3,
    available: false,
    responseTime: 5,
    position: { lat: 4.6097, lng: -74.0817 },
    serviceType: 'dog-walking',
  };
}

export {
  resolveEffectiveStatus,
  formatReservationDate,
  formatReservationTime,
  formatCurrency,
  calculateBookingTotals,
} from './reservationUtils';
