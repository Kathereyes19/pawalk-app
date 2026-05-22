import type { DogSizeAccept, PetSpeciesAccept } from './walker';

export type HomeServiceCategory = 'walkers' | 'caregivers' | 'veterinary';

export type PetTypeFilter = 'dog' | 'cat' | 'both' | null;
export type DogSizeFilter = DogSizeAccept;
export type WalkDurationFilter = 30 | 60 | 90;
export type DistanceFilter = 'near' | 1 | 3 | 5 | null;
export type WalkerSortBy = 'distance' | 'rating';
export type ExperienceFilter = null | 3 | 5 | 8;

export interface WalkersCategoryFilters {
  dogSizes: DogSizeFilter[];
  walkDurations: WalkDurationFilter[];
  availableNow: boolean;
  distance: DistanceFilter;
  petType: PetTypeFilter;
  sortBy: WalkerSortBy;
}

export interface CaregiversCategoryFilters {
  overnightCare: boolean;
  inHomeCare: boolean;
  multiPet: boolean;
  experienceMin: ExperienceFilter;
  distance: DistanceFilter;
  petType: PetTypeFilter;
  sortBy: WalkerSortBy;
}

export interface VeterinaryCategoryFilters {
  openNow: boolean;
  emergency: boolean;
  vaccination: boolean;
  grooming: boolean;
  distance: DistanceFilter;
  sortBy: WalkerSortBy;
}

export type CategoryFiltersMap = {
  walkers: WalkersCategoryFilters;
  caregivers: CaregiversCategoryFilters;
  veterinary: VeterinaryCategoryFilters;
};

export const DEFAULT_WALKERS_FILTERS: WalkersCategoryFilters = {
  dogSizes: [],
  walkDurations: [],
  availableNow: false,
  distance: null,
  petType: null,
  sortBy: 'distance',
};

export const DEFAULT_CAREGIVERS_FILTERS: CaregiversCategoryFilters = {
  overnightCare: false,
  inHomeCare: false,
  multiPet: false,
  experienceMin: null,
  distance: null,
  petType: null,
  sortBy: 'distance',
};

export const DEFAULT_VETERINARY_FILTERS: VeterinaryCategoryFilters = {
  openNow: false,
  emergency: false,
  vaccination: false,
  grooming: false,
  distance: null,
  sortBy: 'distance',
};

export const DEFAULT_CATEGORY_FILTERS: CategoryFiltersMap = {
  walkers: DEFAULT_WALKERS_FILTERS,
  caregivers: DEFAULT_CAREGIVERS_FILTERS,
  veterinary: DEFAULT_VETERINARY_FILTERS,
};

export const HOME_CATEGORIES: {
  id: HomeServiceCategory;
  label: string;
  shortLabel: string;
  icon: string;
  resultsTitle: string;
  emptyTitle: string;
  emptyDescription: string;
}[] = [
  {
    id: 'walkers',
    label: 'Paseadores',
    shortLabel: 'Paseos',
    icon: '🐕',
    resultsTitle: 'Paseadores cerca',
    emptyTitle: 'No hay paseadores',
    emptyDescription: 'Prueba ampliar la distancia o quitar algunos filtros.',
  },
  {
    id: 'caregivers',
    label: 'Cuidadores',
    shortLabel: 'Cuidado',
    icon: '🏠',
    resultsTitle: 'Cuidadores cerca',
    emptyTitle: 'No hay cuidadores',
    emptyDescription: 'Ajusta el tipo de cuidado o la distancia de búsqueda.',
  },
  {
    id: 'veterinary',
    label: 'Veterinaria',
    shortLabel: 'Vet',
    icon: '🩺',
    resultsTitle: 'Clínicas cerca',
    emptyTitle: 'No hay clínicas',
    emptyDescription: 'Prueba otra zona o servicios veterinarios.',
  },
];

export type WalkersQuickFilterId = 'nearby' | 'available-now' | 'small-dogs';
export type CaregiversQuickFilterId = 'overnight' | 'multi-pet' | 'experienced';
export type VeterinaryQuickFilterId = 'open-now' | 'emergency' | 'nearest';

export type CategoryQuickFilterId =
  | WalkersQuickFilterId
  | CaregiversQuickFilterId
  | VeterinaryQuickFilterId;

export const QUICK_FILTERS_BY_CATEGORY: Record<
  HomeServiceCategory,
  { id: CategoryQuickFilterId; label: string }[]
> = {
  walkers: [
    { id: 'nearby', label: 'Cerca de ti' },
    { id: 'available-now', label: 'Disponibles ahora' },
    { id: 'small-dogs', label: 'Perros pequeños' },
  ],
  caregivers: [
    { id: 'overnight', label: 'Cuidado nocturno' },
    { id: 'multi-pet', label: 'Multi-mascota' },
    { id: 'experienced', label: 'Más experiencia' },
  ],
  veterinary: [
    { id: 'open-now', label: 'Abierto ahora' },
    { id: 'emergency', label: 'Emergencias' },
    { id: 'nearest', label: 'Más cercano' },
  ],
};

/** @deprecated use homeDiscovery types */
export type WalkerFilterState = WalkersCategoryFilters & {
  availability: null | 'now';
  rating: null;
  serviceTypes: never[];
  verifiedOnly: boolean;
  priceRange: null;
};

export const DEFAULT_WALKER_FILTERS = DEFAULT_WALKERS_FILTERS;
