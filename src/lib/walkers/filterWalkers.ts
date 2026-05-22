import type { Walker } from '@/types';
import type {
  CaregiversCategoryFilters,
  CategoryFiltersMap,
  CategoryQuickFilterId,
  HomeServiceCategory,
  VeterinaryCategoryFilters,
  WalkersCategoryFilters,
} from '@/types/homeDiscovery';
import {
  DEFAULT_CATEGORY_FILTERS,
  DEFAULT_CAREGIVERS_FILTERS,
  DEFAULT_VETERINARY_FILTERS,
  DEFAULT_WALKERS_FILTERS,
} from '@/types/homeDiscovery';
import { filterProvidersByCategory } from './serviceCategory';

function walkerSpecies(walker: Walker) {
  return walker.acceptedSpecies ?? ['dog'];
}

function walkerSizes(walker: Walker) {
  return walker.acceptedSizes ?? ['small', 'medium', 'large'];
}

function matchesPetType(walker: Walker, petType: WalkersCategoryFilters['petType']): boolean {
  if (!petType) return true;
  const species = walkerSpecies(walker);
  if (petType === 'dog') return species.includes('dog');
  if (petType === 'cat') return species.includes('cat');
  if (petType === 'both') return species.includes('dog') && species.includes('cat');
  return true;
}

function matchesDistance(walker: Walker, distance: WalkersCategoryFilters['distance']): boolean {
  if (!distance) return true;
  if (distance === 'near') return walker.distance <= 1.5;
  return walker.distance <= distance;
}

function sortProviders(walkers: Walker[], sortBy: 'distance' | 'rating'): Walker[] {
  const sorted = [...walkers];
  if (sortBy === 'rating') {
    sorted.sort((a, b) => b.rating - a.rating || a.distance - b.distance);
  } else {
    sorted.sort((a, b) => a.distance - b.distance);
  }
  return sorted;
}

function filterWalkersCategory(
  walkers: Walker[],
  filters: WalkersCategoryFilters
): Walker[] {
  let result = [...walkers];

  result = result.filter((walker) => matchesPetType(walker, filters.petType));
  result = result.filter((walker) => matchesDistance(walker, filters.distance));

  if (filters.availableNow) {
    result = result.filter((walker) => walker.available);
  }

  if (filters.dogSizes.length > 0) {
    result = result.filter((walker) => {
      const species = walkerSpecies(walker);
      if (!species.includes('dog')) return false;
      const sizes = walkerSizes(walker);
      return filters.dogSizes.some((size) => sizes.includes(size));
    });
  }

  if (filters.walkDurations.length > 0) {
    result = result.filter((walker) => {
      const durations = walker.walkDurations ?? [30, 60, 90];
      return filters.walkDurations.some((duration) => durations.includes(duration));
    });
  }

  return sortProviders(result, filters.sortBy);
}

function filterCaregiversCategory(
  walkers: Walker[],
  filters: CaregiversCategoryFilters
): Walker[] {
  let result = [...walkers];

  result = result.filter((walker) => matchesPetType(walker, filters.petType));
  result = result.filter((walker) => matchesDistance(walker, filters.distance));

  if (filters.overnightCare) {
    result = result.filter((walker) => walker.caregiverServices?.includes('overnight'));
  }
  if (filters.inHomeCare) {
    result = result.filter((walker) => walker.caregiverServices?.includes('in-home'));
  }
  if (filters.multiPet) {
    result = result.filter((walker) => walker.caregiverServices?.includes('multi-pet'));
  }
  if (filters.experienceMin) {
    result = result.filter((walker) => walker.experience >= filters.experienceMin!);
  }

  return sortProviders(result, filters.sortBy);
}

function filterVeterinaryCategory(
  walkers: Walker[],
  filters: VeterinaryCategoryFilters
): Walker[] {
  let result = [...walkers];

  result = result.filter((walker) => matchesDistance(walker, filters.distance));

  if (filters.openNow) {
    result = result.filter((walker) => walker.available);
  }
  if (filters.emergency) {
    result = result.filter((walker) => walker.vetServices?.includes('emergency'));
  }
  if (filters.vaccination) {
    result = result.filter((walker) => walker.vetServices?.includes('vaccination'));
  }
  if (filters.grooming) {
    result = result.filter(
      (walker) =>
        walker.vetServices?.includes('grooming') || walker.serviceType === 'grooming'
    );
  }

  return sortProviders(result, filters.sortBy);
}

export function filterDiscoveryProviders(
  providers: Walker[],
  category: HomeServiceCategory,
  filters: CategoryFiltersMap[HomeServiceCategory],
  searchQuery = ''
): Walker[] {
  let result = filterProvidersByCategory(providers, category);

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter((provider) => provider.name.toLowerCase().includes(query));
  }

  switch (category) {
    case 'walkers':
      return filterWalkersCategory(result, filters as WalkersCategoryFilters);
    case 'caregivers':
      return filterCaregiversCategory(result, filters as CaregiversCategoryFilters);
    case 'veterinary':
      return filterVeterinaryCategory(result, filters as VeterinaryCategoryFilters);
    default:
      return result;
  }
}

export function countCategoryActiveFilters(
  category: HomeServiceCategory,
  filters: CategoryFiltersMap[HomeServiceCategory]
): number {
  switch (category) {
    case 'walkers': {
      const f = filters as WalkersCategoryFilters;
      let count = 0;
      if (f.dogSizes.length) count++;
      if (f.walkDurations.length) count++;
      if (f.availableNow) count++;
      if (f.distance) count++;
      if (f.petType) count++;
      if (f.sortBy === 'rating') count++;
      return count;
    }
    case 'caregivers': {
      const f = filters as CaregiversCategoryFilters;
      let count = 0;
      if (f.overnightCare) count++;
      if (f.inHomeCare) count++;
      if (f.multiPet) count++;
      if (f.experienceMin) count++;
      if (f.distance) count++;
      if (f.petType) count++;
      if (f.sortBy === 'rating') count++;
      return count;
    }
    case 'veterinary': {
      const f = filters as VeterinaryCategoryFilters;
      let count = 0;
      if (f.openNow) count++;
      if (f.emergency) count++;
      if (f.vaccination) count++;
      if (f.grooming) count++;
      if (f.distance) count++;
      if (f.sortBy === 'rating') count++;
      return count;
    }
    default:
      return 0;
  }
}

export function clearCategoryFilters(category: HomeServiceCategory) {
  switch (category) {
    case 'walkers':
      return { ...DEFAULT_WALKERS_FILTERS };
    case 'caregivers':
      return { ...DEFAULT_CAREGIVERS_FILTERS };
    case 'veterinary':
      return { ...DEFAULT_VETERINARY_FILTERS };
    default:
      return { ...DEFAULT_WALKERS_FILTERS };
  }
}

export function isCategoryQuickFilterActive(
  category: HomeServiceCategory,
  filters: CategoryFiltersMap[HomeServiceCategory],
  id: CategoryQuickFilterId
): boolean {
  switch (category) {
    case 'walkers': {
      const f = filters as WalkersCategoryFilters;
      if (id === 'nearby') return f.distance === 'near';
      if (id === 'available-now') return f.availableNow;
      if (id === 'small-dogs') return f.dogSizes.includes('small');
      return false;
    }
    case 'caregivers': {
      const f = filters as CaregiversCategoryFilters;
      if (id === 'overnight') return f.overnightCare;
      if (id === 'multi-pet') return f.multiPet;
      if (id === 'experienced') return f.experienceMin === 5;
      return false;
    }
    case 'veterinary': {
      const f = filters as VeterinaryCategoryFilters;
      if (id === 'open-now') return f.openNow;
      if (id === 'emergency') return f.emergency;
      if (id === 'nearest') return f.distance === 'near' && f.sortBy === 'distance';
      return false;
    }
    default:
      return false;
  }
}

export function toggleCategoryQuickFilter<C extends HomeServiceCategory>(
  category: C,
  filters: CategoryFiltersMap[C],
  id: CategoryQuickFilterId
): CategoryFiltersMap[C] {
  switch (category) {
    case 'walkers': {
      const f = { ...(filters as WalkersCategoryFilters) };
      if (id === 'nearby') f.distance = f.distance === 'near' ? null : 'near';
      if (id === 'available-now') f.availableNow = !f.availableNow;
      if (id === 'small-dogs') {
        f.dogSizes = f.dogSizes.includes('small')
          ? f.dogSizes.filter((size) => size !== 'small')
          : [...f.dogSizes, 'small'];
      }
      return f as CategoryFiltersMap[C];
    }
    case 'caregivers': {
      const f = { ...(filters as CaregiversCategoryFilters) };
      if (id === 'overnight') f.overnightCare = !f.overnightCare;
      if (id === 'multi-pet') f.multiPet = !f.multiPet;
      if (id === 'experienced') {
        const nextMin = f.experienceMin === 5 ? null : 5;
        f.experienceMin = nextMin;
        if (nextMin === 5) f.sortBy = 'rating';
      }
      return f as CategoryFiltersMap[C];
    }
    case 'veterinary': {
      const f = { ...(filters as VeterinaryCategoryFilters) };
      if (id === 'open-now') f.openNow = !f.openNow;
      if (id === 'emergency') f.emergency = !f.emergency;
      if (id === 'nearest') {
        const active = f.distance === 'near';
        f.distance = active ? null : 'near';
        f.sortBy = 'distance';
      }
      return f as CategoryFiltersMap[C];
    }
    default:
      return filters;
  }
}

/** @deprecated use filterDiscoveryProviders */
export function filterWalkers(
  walkers: Walker[],
  filters: WalkersCategoryFilters,
  searchQuery = ''
): Walker[] {
  return filterDiscoveryProviders(walkers, 'walkers', filters, searchQuery);
}

export function clearWalkerFilters(): WalkersCategoryFilters {
  return { ...DEFAULT_WALKERS_FILTERS };
}

export const DEFAULT_WALKER_FILTERS = DEFAULT_WALKERS_FILTERS;
