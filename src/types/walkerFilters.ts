import type { WalkerServiceType } from './walker';

export type PetTypeFilter = 'dog' | 'cat' | 'both' | null;
export type DogSizeFilter = 'small' | 'medium' | 'large';
export type AvailabilityFilter = 'now' | 'today' | 'tomorrow' | null;
export type RatingFilter = 'highest' | '4.5+' | '5' | null;
export type DistanceFilter = 'near' | 1 | 3 | 5 | null;
export type WalkerSortBy = 'distance' | 'rating';
export type QuickFilterId = 'nearby' | 'top-rated' | 'available-now';

export interface WalkerFilterState {
  petType: PetTypeFilter;
  dogSizes: DogSizeFilter[];
  availability: AvailabilityFilter;
  rating: RatingFilter;
  distance: DistanceFilter;
  serviceTypes: WalkerServiceType[];
  verifiedOnly: boolean;
  priceRange: 'economy' | 'standard' | 'premium' | null;
  sortBy: WalkerSortBy;
}

export const DEFAULT_WALKER_FILTERS: WalkerFilterState = {
  petType: null,
  dogSizes: [],
  availability: null,
  rating: null,
  distance: null,
  serviceTypes: [],
  verifiedOnly: false,
  priceRange: null,
  sortBy: 'distance',
};

export const SERVICE_TYPE_OPTIONS: {
  value: WalkerServiceType;
  label: string;
  icon: string;
}[] = [
  { value: 'dog-walking', label: 'Paseos', icon: '🐕' },
  { value: 'pet-sitting', label: 'Cuidado de mascotas', icon: '🏠' },
  { value: 'grooming', label: 'Grooming / Spa', icon: '✨' },
  { value: 'veterinary', label: 'Veterinaria', icon: '🩺' },
];

export const QUICK_FILTER_OPTIONS: {
  id: QuickFilterId;
  label: string;
}[] = [
  { id: 'nearby', label: 'Cerca de ti' },
  { id: 'top-rated', label: 'Mejor calificados' },
  { id: 'available-now', label: 'Disponibles ahora' },
];
