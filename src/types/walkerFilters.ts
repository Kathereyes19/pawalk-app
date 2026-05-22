/** @deprecated Import from `@/types/homeDiscovery` instead. */
export type {
  WalkerFilterState,
  PetTypeFilter,
  DogSizeFilter,
  DistanceFilter,
  WalkerSortBy,
  CategoryQuickFilterId as QuickFilterId,
} from './homeDiscovery';

export {
  DEFAULT_WALKER_FILTERS,
  QUICK_FILTERS_BY_CATEGORY,
} from './homeDiscovery';

/** @deprecated use QUICK_FILTERS_BY_CATEGORY.walkers */
export const QUICK_FILTER_OPTIONS = [
  { id: 'nearby', label: 'Cerca de ti' },
  { id: 'available-now', label: 'Disponibles ahora' },
  { id: 'small-dogs', label: 'Perros pequeños' },
];

/** @deprecated category-specific services are implicit per tab */
export const SERVICE_TYPE_OPTIONS = [] as const;

export type AvailabilityFilter = 'now' | 'today' | 'tomorrow' | null;
export type RatingFilter = 'highest' | '4.5+' | '5' | null;
