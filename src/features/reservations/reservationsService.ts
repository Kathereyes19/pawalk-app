import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import { ensureReservationId } from '@/lib/reservationId';
import { isValidUuid } from '@/lib/petId';
import {
  loadStoredReservations,
  saveStoredReservations,
} from '@/lib/reservationStorage';
import { isScheduledInFuture } from '@/lib/bookingDates';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import {
  calculateCategoryBookingTotals,
  getInstitutionMeta,
  VET_SERVICE_CATALOG,
  type VetBookableServiceId,
} from '@/lib/providers/serviceExperience';
import {
  normalizeReservationCategory,
  reservationToProvider,
} from '@/lib/providers/reservationCategory';
import {
  calculateBookingTotals,
  computeWalkSummaryMetrics,
  getReservationPetCount,
  parseScheduledAt,
  resolveEffectiveStatus,
} from './reservationUtils';
import type {
  BookingData,
  HomeServiceCategory,
  Reservation,
  ReservationPet,
  ReservationRow,
  ReservationStatus,
  Walker,
} from '@/types';

function normalizeReservation(reservation: Reservation): Reservation {
  const withPets = reservation.pets?.length
    ? reservation
    : {
        ...reservation,
        pets: reservation.petId
          ? [{ id: reservation.petId, name: reservation.petName }]
          : [{ id: 'unknown', name: reservation.petName ?? 'Mascota' }],
      };
  return normalizeReservationCategory(withPets);
}

function buildPetsFromRow(row: ReservationRow): ReservationPet[] {
  if (row.pet_ids?.length) {
    return row.pet_ids.map((id, index) => ({
      id,
      name: row.pet_names?.[index] ?? row.pet_name,
      avatar: row.pet_avatars?.[index] ?? undefined,
    }));
  }
  if (row.pet_id) {
    return [{ id: row.pet_id, name: row.pet_name }];
  }
  return [{ id: 'unknown', name: row.pet_name }];
}

function applyCompletionMetrics(reservation: Reservation): Reservation {
  const distanceKm = reservation.summaryDistanceKm ?? 0;
  const durationMinutes =
    reservation.summaryDurationMinutes ?? reservation.durationMinutes;
  const petCount = getReservationPetCount(reservation);
  const metrics = computeWalkSummaryMetrics(distanceKm, durationMinutes, petCount);
  return {
    ...reservation,
    summaryPaceKmh: reservation.summaryPaceKmh ?? metrics.paceKmh,
    summaryCalories: reservation.summaryCalories ?? metrics.calories,
  };
}

function formatScheduledTime(value?: string | null): string {
  if (!value) return '10:00';
  return value.length === 5 ? value : value.slice(0, 5);
}

function mergeReservationFromRow(row: ReservationRow, fallback: Reservation): Reservation {
  const mapped = mapRowToReservation(row);
  return normalizeReservationCategory({
    ...mapped,
    serviceCategory: row.service_category ?? fallback.serviceCategory,
    serviceType: row.service_type ?? fallback.serviceType ?? null,
    selectedServiceId: row.selected_service_id ?? fallback.selectedServiceId ?? null,
    selectedServiceName: row.selected_service_name ?? fallback.selectedServiceName ?? null,
    careInstructions: row.care_instructions ?? fallback.careInstructions ?? null,
    isOvernight: row.is_overnight ?? fallback.isOvernight ?? false,
    institutionAddress: row.institution_address ?? fallback.institutionAddress ?? null,
  });
}

function mapRowToReservation(row: ReservationRow): Reservation {
  const pets = buildPetsFromRow(row);
  return {
    id: row.id,
    userId: row.user_id,
    walkerId: row.walker_id,
    walkerName: row.walker_name,
    walkerAvatar: row.walker_avatar ?? '🐕',
    petId: row.pet_id ?? pets[0]?.id ?? null,
    petName: pets.map((pet) => pet.name).join(', ') || row.pet_name,
    pets,
    scheduledDate: row.scheduled_date,
    scheduledTime: formatScheduledTime(row.scheduled_time),
    durationMinutes: row.duration_minutes,
    serviceCategory: row.service_category ?? 'walkers',
    serviceType: row.service_type ?? null,
    selectedServiceId: row.selected_service_id ?? null,
    selectedServiceName: row.selected_service_name ?? null,
    careInstructions: row.care_instructions ?? null,
    isOvernight: row.is_overnight ?? false,
    institutionAddress: row.institution_address ?? null,
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
    summaryPaceKmh: row.summary_pace_kmh ? Number(row.summary_pace_kmh) : null,
    summaryCalories: row.summary_calories,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function resolvePersistablePets(reservation: Reservation): ReservationPet[] {
  const pets = reservation.pets?.length
    ? reservation.pets
    : [{ id: reservation.petId ?? 'unknown', name: reservation.petName }];
  return pets.map((pet) => ({
    id: pet.id,
    name: pet.name,
    avatar: pet.avatar,
  }));
}

function mapReservationToLegacyRow(
  reservation: Reservation
): Omit<ReservationRow, 'created_at' | 'updated_at' | 'service_category' | 'service_type' | 'selected_service_id' | 'selected_service_name' | 'care_instructions' | 'is_overnight' | 'institution_address'> {
  const pets = resolvePersistablePets(reservation);
  const validPetIds = pets.map((pet) => pet.id).filter((id) => isValidUuid(id));
  const primaryPetId = validPetIds[0] ?? null;

  return {
    id: reservation.id,
    user_id: reservation.userId,
    walker_id: reservation.walkerId,
    walker_name: reservation.walkerName,
    walker_avatar: reservation.walkerAvatar,
    pet_id: primaryPetId,
    pet_name: pets.map((pet) => pet.name).join(', ') || reservation.petName,
    pet_ids: validPetIds,
    pet_names: pets.map((pet) => pet.name),
    pet_avatars: pets.map((pet) => pet.avatar ?? ''),
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
    summary_pace_kmh: reservation.summaryPaceKmh ?? null,
    summary_calories: reservation.summaryCalories ?? null,
  };
}

function mapReservationToRow(reservation: Reservation): Omit<ReservationRow, 'created_at' | 'updated_at'> {
  const pets = resolvePersistablePets(reservation);
  const validPetIds = pets.map((pet) => pet.id).filter((id) => isValidUuid(id));
  const primaryPetId = validPetIds[0] ?? null;

  return {
    ...mapReservationToLegacyRow(reservation),
    service_category: reservation.serviceCategory ?? 'walkers',
    service_type: reservation.serviceType ?? null,
    selected_service_id: reservation.selectedServiceId ?? null,
    selected_service_name: reservation.selectedServiceName ?? null,
    care_instructions: reservation.careInstructions ?? null,
    is_overnight: reservation.isOvernight ?? false,
    institution_address: reservation.institutionAddress ?? null,
    pet_id: primaryPetId,
    pet_ids: validPetIds,
  };
}

function upsertLocalReservation(userId: string, reservation: Reservation): void {
  const existing = loadStoredReservations(userId);
  saveStoredReservations(userId, [
    reservation,
    ...existing.filter((item) => item.id !== reservation.id),
  ]);
}

function isSchemaMismatchError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('column') ||
    normalized.includes('schema cache') ||
    normalized.includes('could not find') ||
    normalized.includes('does not exist')
  );
}

function isForeignKeyError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('foreign key') || normalized.includes('violates foreign key');
}

async function persistReservationRecord(
  userId: string,
  reservation: Reservation
): Promise<{ reservation: Reservation; error: Error | null }> {
  const normalized = normalizeReservationCategory(reservation);
  upsertLocalReservation(userId, normalized);

  if (!isSupabaseConfigured()) {
    return { reservation: normalized, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { reservation: normalized, error: null };
  }

  const attempts: Array<Record<string, unknown>> = [
    mapReservationToRow(normalized),
    mapReservationToLegacyRow(normalized),
    { ...mapReservationToLegacyRow(normalized), pet_id: null, pet_ids: [] },
  ];

  let lastError: Error | null = null;

  for (const row of attempts) {
    const { data, error } = await supabase.from('bookings').insert(row).select('*').single();
    if (!error && data) {
      return {
        reservation: mergeReservationFromRow(data as ReservationRow, normalized),
        error: null,
      };
    }

    const message = error?.message ?? 'Could not save reservation';
    lastError = new Error(message);

    if (!isSchemaMismatchError(message) && !isForeignKeyError(message)) {
      break;
    }
  }

  if (lastError) {
    console.warn('[Pawalk] Supabase booking sync failed; kept local reservation.', lastError.message);
  }

  return {
    reservation: normalized,
    error: null,
  };
}

function getAvailabilityErrorMessage(category: HomeServiceCategory): string {
  switch (category) {
    case 'caregivers':
      return 'El horario seleccionado es anterior a la disponibilidad del cuidador.';
    case 'veterinary':
      return 'El horario seleccionado es anterior a la disponibilidad del centro.';
    default:
      return 'El horario seleccionado es anterior a la disponibilidad del paseador.';
  }
}

function applyAutoStatus(reservation: Reservation, now = new Date()): Reservation {
  const effective = resolveEffectiveStatus(reservation, now);
  if (effective === reservation.status) return reservation;

  const next: Reservation = { ...reservation, status: effective, updatedAt: now.toISOString() };

  if (effective === 'active' && !next.startedAt) {
    next.startedAt = parseScheduledAt(reservation).toISOString();
  }

  if (effective === 'completed' && !next.completedAt) {
    next.completedAt = now.toISOString();
    next.summaryDurationMinutes = next.summaryDurationMinutes ?? next.durationMinutes;
    next.summaryDistanceKm = next.summaryDistanceKm ?? Number((1.8 + Math.random() * 1.5).toFixed(1));
    return applyCompletionMetrics(next);
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

  const changed = updated.filter((item) => {
    const original = reservations.find((entry) => entry.id === item.id);
    if (!original) return true;
    return (
      original.status !== item.status ||
      original.startedAt !== item.startedAt ||
      original.completedAt !== item.completedAt ||
      original.summaryDistanceKm !== item.summaryDistanceKm ||
      original.summaryDurationMinutes !== item.summaryDurationMinutes ||
      original.summaryPaceKmh !== item.summaryPaceKmh ||
      original.summaryCalories !== item.summaryCalories
    );
  });

  for (const reservation of changed) {
    await supabase
      .from('bookings')
      .update({
        status: reservation.status,
        started_at: reservation.startedAt,
        completed_at: reservation.completedAt,
        summary_distance_km: reservation.summaryDistanceKm,
        summary_duration_minutes: reservation.summaryDurationMinutes,
        summary_pace_kmh: reservation.summaryPaceKmh,
        summary_calories: reservation.summaryCalories,
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
    const stored = loadStoredReservations(userId)
      .map(normalizeReservation)
      .map((item) => applyAutoStatus(item));
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
    const stored = loadStoredReservations(userId)
      .map(normalizeReservation)
      .map((item) => applyAutoStatus(item));
    return { reservations: sortReservations(stored), error: new Error(error.message) };
  }

  const localById = new Map(
    loadStoredReservations(userId).map((item) => [item.id, normalizeReservationCategory(item)])
  );

  const raw = (data as ReservationRow[]).map((row) => {
    const local = localById.get(row.id);
    return local ? mergeReservationFromRow(row, local) : mapRowToReservation(row);
  });

  const remoteIds = new Set(raw.map((item) => item.id));
  const localOnly = [...localById.values()].filter((item) => !remoteIds.has(item.id));
  const merged = [...raw, ...localOnly];
  const withStatus = merged.map((item) => applyAutoStatus(item));
  saveStoredReservations(
    userId,
    sortReservations(withStatus).map((item) => normalizeReservationCategory(item))
  );
  const synced = await syncReservationUpdates(userId, merged, withStatus);
  return { reservations: sortReservations(synced), error: null };
}

export interface CreateReservationInput {
  walker: Walker;
  bookingData: BookingData;
  pets?: ReservationPet[];
  petId?: string | null;
  petName?: string;
  paymentMethod?: string;
}

function resolveReservationPets(input: CreateReservationInput): ReservationPet[] {
  if (input.pets?.length) return input.pets;
  if (input.bookingData.pets?.length) return input.bookingData.pets;
  if (input.petId && input.petName) {
    return [{ id: input.petId, name: input.petName }];
  }
  return [{ id: 'unknown', name: input.petName ?? input.bookingData.petName ?? 'Mascota' }];
}

export async function createReservation(
  userId: string,
  input: CreateReservationInput
): Promise<{ reservation: Reservation | null; error: Error | null }> {
  const durationMinutes = input.bookingData.duration ?? 60;
  const scheduledDate = input.bookingData.date ?? new Date().toISOString().slice(0, 10);
  const scheduledTime = input.bookingData.time ?? '10:00';
  const serviceCategory =
    input.bookingData.serviceCategory ?? getWalkerHomeCategory(input.walker);

  if (!isScheduledInFuture(scheduledDate, scheduledTime)) {
    return {
      reservation: null,
      error: new Error('La fecha y hora seleccionadas deben ser futuras.'),
    };
  }

  if (isBeforeWalkerAvailability(scheduledDate, scheduledTime, input.walker)) {
    return {
      reservation: null,
      error: new Error(getAvailabilityErrorMessage(serviceCategory)),
    };
  }

  const pets = resolveReservationPets(input);
  const selectedService =
    serviceCategory === 'veterinary' && input.bookingData.selectedServiceId
      ? VET_SERVICE_CATALOG[input.bookingData.selectedServiceId as VetBookableServiceId] ?? null
      : null;
  const totals =
    input.bookingData.total != null && input.bookingData.serviceFee != null
      ? {
          servicePrice: input.bookingData.serviceFee,
          platformFee: input.bookingData.platformFee ?? Math.round(input.bookingData.serviceFee * 0.12),
          insuranceFee: Math.round(input.bookingData.serviceFee * 0.05),
          totalPrice: input.bookingData.total,
          petCount: pets.length,
        }
      : calculateCategoryBookingTotals(
          input.walker,
          serviceCategory,
          durationMinutes,
          pets.length,
          selectedService
        );
  const now = new Date().toISOString();
  const institutionMeta =
    serviceCategory === 'veterinary' ? getInstitutionMeta(input.walker) : null;

  const reservation: Reservation = {
    id: ensureReservationId(),
    userId,
    walkerId: input.walker.id,
    walkerName: input.walker.name,
    walkerAvatar: input.walker.avatar,
    pets,
    petId: pets[0]?.id ?? null,
    petName: pets.map((pet) => pet.name).join(', '),
    scheduledDate,
    scheduledTime,
    durationMinutes,
    serviceCategory,
    serviceType: input.walker.serviceType ?? null,
    selectedServiceId: input.bookingData.selectedServiceId ?? null,
    selectedServiceName: input.bookingData.selectedServiceName ?? null,
    careInstructions: input.bookingData.careInstructions ?? null,
    isOvernight: input.bookingData.isOvernight ?? durationMinutes >= 1440,
    institutionAddress:
      input.bookingData.institutionAddress ?? institutionMeta?.address ?? null,
    status: 'scheduled',
    servicePrice: totals.servicePrice,
    platformFee: totals.platformFee,
    insuranceFee: totals.insuranceFee,
    totalPrice: totals.totalPrice,
    paymentMethod: input.paymentMethod ?? 'card',
    createdAt: now,
    updatedAt: now,
  };

  const { reservation: persisted } = await persistReservationRecord(userId, reservation);
  return { reservation: persisted, error: null };
}

export async function updateReservationStatus(
  userId: string,
  reservationId: string,
  status: ReservationStatus
): Promise<{ error: Error | null }> {
  const now = new Date().toISOString();
  const existing = loadStoredReservations(userId).find((item) => item.id === reservationId);

  const patch: Partial<Reservation> = { status, updatedAt: now };

  if (status === 'active') {
    patch.startedAt = existing?.startedAt ?? now;
  }

  if (status === 'completed') {
    patch.completedAt = now;
    patch.summaryDurationMinutes = existing?.summaryDurationMinutes ?? existing?.durationMinutes;
    patch.summaryDistanceKm =
      existing?.summaryDistanceKm ?? Number((1.8 + Math.random() * 1.5).toFixed(1));
    Object.assign(patch, applyCompletionMetrics({ ...(existing ?? {}), ...patch } as Reservation));
  }

  if (!isSupabaseConfigured()) {
    const all = loadStoredReservations(userId);
    const next = all.map((item) =>
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
      started_at: status === 'active' ? patch.startedAt : undefined,
      completed_at: status === 'completed' ? patch.completedAt : undefined,
      summary_distance_km: status === 'completed' ? patch.summaryDistanceKm : undefined,
      summary_duration_minutes: status === 'completed' ? patch.summaryDurationMinutes : undefined,
      summary_pace_kmh: status === 'completed' ? patch.summaryPaceKmh : undefined,
      summary_calories: status === 'completed' ? patch.summaryCalories : undefined,
      updated_at: now,
    })
    .eq('id', reservationId)
    .eq('user_id', userId);

  return { error: error ? new Error(error.message) : null };
}

export async function completeReservation(
  userId: string,
  reservationId: string,
  summary?: { distanceKm?: number; durationMinutes?: number }
): Promise<{ error: Error | null }> {
  const now = new Date().toISOString();
  const existing = loadStoredReservations(userId).find((item) => item.id === reservationId);

  const patch: Partial<Reservation> = {
    status: 'completed',
    completedAt: now,
    updatedAt: now,
    summaryDurationMinutes:
      summary?.durationMinutes ?? existing?.summaryDurationMinutes ?? existing?.durationMinutes,
    summaryDistanceKm:
      summary?.distanceKm ??
      existing?.summaryDistanceKm ??
      Number((1.8 + Math.random() * 1.5).toFixed(1)),
  };
  Object.assign(patch, applyCompletionMetrics({ ...(existing ?? {}), ...patch } as Reservation));

  if (!isSupabaseConfigured()) {
    const all = loadStoredReservations(userId);
    const next = all.map((item) =>
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
      status: 'completed',
      completed_at: now,
      summary_distance_km: patch.summaryDistanceKm,
      summary_duration_minutes: patch.summaryDurationMinutes,
      summary_pace_kmh: patch.summaryPaceKmh,
      summary_calories: patch.summaryCalories,
      updated_at: now,
    })
    .eq('id', reservationId)
    .eq('user_id', userId);

  return { error: error ? new Error(error.message) : null };
}

export function reservationToWalker(reservation: Reservation): Walker {
  return reservationToProvider(reservation);
}

export {
  resolveEffectiveStatus,
  formatReservationDate,
  formatReservationTime,
  formatCurrency,
  calculateBookingTotals,
} from './reservationUtils';
