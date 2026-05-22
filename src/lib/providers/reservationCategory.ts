import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import { MOCK_WALKERS } from '@/lib/walkers/mockWalkers';
import type { HomeServiceCategory } from '@/types/homeDiscovery';
import type { Reservation } from '@/types/reservation';
import type { Walker } from '@/types/walker';

export type ReservationCategoryFilter = 'all' | HomeServiceCategory;

export function getReservationCategory(reservation: Reservation): HomeServiceCategory {
  if (reservation.serviceCategory) return reservation.serviceCategory;
  return 'walkers';
}

export function normalizeReservationCategory(reservation: Reservation): Reservation {
  const serviceCategory = reservation.serviceCategory ?? 'walkers';
  return {
    ...reservation,
    serviceCategory,
    isOvernight: reservation.isOvernight ?? (serviceCategory === 'caregivers' && reservation.durationMinutes >= 1440),
  };
}

export function filterReservationsByCategory(
  reservations: Reservation[],
  filter: ReservationCategoryFilter
): Reservation[] {
  if (filter === 'all') return reservations;
  return reservations.filter((item) => getReservationCategory(item) === filter);
}

export function reservationToProvider(reservation: Reservation): Walker {
  const fromMock = MOCK_WALKERS.find((walker) => walker.id === reservation.walkerId);
  if (fromMock) return fromMock;

  const category = getReservationCategory(reservation);
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
    position: { lat: 3.4516, lng: -76.532 },
    homeCategory: category,
    serviceType:
      category === 'caregivers'
        ? 'pet-sitting'
        : category === 'veterinary'
          ? 'veterinary'
          : 'dog-walking',
    acceptedSpecies: ['dog'],
    acceptedSizes: ['small', 'medium', 'large'],
    nextAvailableDate: null,
    nextAvailableTime: null,
  };
}

export function inferCategoryFromWalker(walker: Walker): HomeServiceCategory {
  return getWalkerHomeCategory(walker);
}
