import { validateBookingAvailability } from '@/lib/providers/bookingAvailability';
import {
  calculateCategoryBookingTotals,
  formatCareDurationLabel,
  getInstitutionMeta,
  getVetServicesForProvider,
  type VetServiceOption,
} from '@/lib/providers/serviceExperience';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import type { BookingData, CaregiverServiceOffer, Pet, Walker } from '@/types';

export function formatBookingDateLabel(dateKey: string, locale: 'es' | 'en' = 'es'): string {
  const date = new Date(`${dateKey}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return locale === 'en' ? 'Today' : 'Hoy';
  if (diffDays === 1) return locale === 'en' ? 'Tomorrow' : 'Mañana';

  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export function formatBookingTimeLabel(time: string): string {
  const [hours, minutes = '00'] = time.split(':');
  const hour = Number(hours);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 || 12;
  return `${normalized}:${minutes} ${suffix}`;
}

export interface ProfileBookingDraftInput {
  walker: Walker;
  selectedDate: string;
  selectedTime: string;
  selectedPetIds: string[];
  pets: Pet[];
  selectedDuration?: 30 | 60 | 90;
  selectedCareDuration?: number;
  selectedCareType?: CaregiverServiceOffer;
  selectedVetService?: VetServiceOption | null;
}

export function buildProfileBookingData(input: ProfileBookingDraftInput): {
  data: BookingData | null;
  error: string | null;
} {
  const {
    walker,
    selectedDate,
    selectedTime,
    selectedPetIds,
    pets,
    selectedDuration = 60,
    selectedCareDuration = 480,
    selectedCareType = 'in-home',
    selectedVetService = null,
  } = input;

  if (!selectedDate) {
    return { data: null, error: 'Por favor selecciona una fecha' };
  }
  if (!selectedTime) {
    return { data: null, error: 'Por favor selecciona una hora' };
  }
  if (selectedPetIds.length === 0) {
    return { data: null, error: 'Selecciona al menos una mascota' };
  }

  const category = getWalkerHomeCategory(walker);
  const effectiveDurationMinutes =
    category === 'walkers'
      ? selectedDuration
      : category === 'caregivers'
        ? selectedCareDuration
        : selectedVetService?.durationMinutes ?? 45;
  const isOvernight = category === 'caregivers' && selectedCareDuration >= 1440;

  const availability = validateBookingAvailability(category, selectedDate, selectedTime, walker, {
    isOvernight,
    duration: effectiveDurationMinutes,
  });
  if (!availability.valid) {
    return { data: null, error: availability.message };
  }

  const selectedPets = pets
    .filter((pet) => selectedPetIds.includes(pet.id))
    .map((pet) => ({ id: pet.id, name: pet.name, avatar: pet.avatar }));
  const vetService =
    selectedVetService ??
    (category === 'veterinary' ? getVetServicesForProvider(walker)[0] : null);
  const totals = calculateCategoryBookingTotals(
    walker,
    category,
    effectiveDurationMinutes,
    selectedPets.length,
    category === 'veterinary' ? vetService : null
  );
  const institutionMeta = category === 'veterinary' ? getInstitutionMeta(walker) : null;

  return {
    data: {
      date: selectedDate,
      time: selectedTime,
      duration: effectiveDurationMinutes,
      durationLabel: formatCareDurationLabel(effectiveDurationMinutes, isOvernight),
      serviceCategory: category,
      selectedServiceId: category === 'veterinary' ? vetService?.id : undefined,
      selectedServiceName: category === 'veterinary' ? vetService?.name : undefined,
      careType: category === 'caregivers' ? selectedCareType : undefined,
      isOvernight,
      institutionAddress: institutionMeta?.address,
      pets: selectedPets,
      petIds: selectedPetIds,
      serviceFee: totals.servicePrice,
      platformFee: totals.platformFee,
      total: totals.totalPrice,
      termsAccepted: true,
    },
    error: null,
  };
}
