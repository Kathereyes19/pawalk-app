import { todayDateKey, tomorrowDateKey } from './availability';
import type { Walker } from '@/types';
import type { QuickFilterId, WalkerFilterState } from '@/types/walkerFilters';
import { DEFAULT_WALKER_FILTERS } from '@/types/walkerFilters';

function walkerSpecies(walker: Walker) {
  return walker.acceptedSpecies ?? ['dog'];
}

function walkerSizes(walker: Walker) {
  return walker.acceptedSizes ?? ['small', 'medium', 'large'];
}

function matchesAvailability(walker: Walker, availability: WalkerFilterState['availability']): boolean {
  if (!availability) return true;

  const today = todayDateKey();
  const tomorrow = tomorrowDateKey();

  if (availability === 'now') return walker.available;
  if (availability === 'today') {
    return walker.available || walker.nextAvailableDate === today;
  }
  if (availability === 'tomorrow') {
    return (
      walker.available ||
      walker.nextAvailableDate === tomorrow ||
      walker.nextAvailableDate === today
    );
  }

  return true;
}

function matchesPetType(walker: Walker, petType: WalkerFilterState['petType']): boolean {
  if (!petType) return true;

  const species = walkerSpecies(walker);

  if (petType === 'dog') return species.includes('dog');
  if (petType === 'cat') return species.includes('cat');
  if (petType === 'both') return species.includes('dog') && species.includes('cat');

  return true;
}

function matchesDogSizes(walker: Walker, dogSizes: WalkerFilterState['dogSizes']): boolean {
  if (dogSizes.length === 0) return true;

  const species = walkerSpecies(walker);
  if (!species.includes('dog')) return false;

  const sizes = walkerSizes(walker);
  return dogSizes.some((size) => sizes.includes(size));
}

function matchesDistance(walker: Walker, distance: WalkerFilterState['distance']): boolean {
  if (!distance) return true;
  if (distance === 'near') return walker.distance <= 1.5;
  return walker.distance <= distance;
}

function matchesRating(walker: Walker, rating: WalkerFilterState['rating']): boolean {
  if (!rating || rating === 'highest') return true;
  if (rating === '4.5+') return walker.rating >= 4.5;
  if (rating === '5') return walker.rating >= 5;
  return true;
}

export function filterWalkers(
  walkers: Walker[],
  filters: WalkerFilterState,
  searchQuery = ''
): Walker[] {
  let result = [...walkers];

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter((walker) => walker.name.toLowerCase().includes(query));
  }

  result = result.filter((walker) => matchesPetType(walker, filters.petType));
  result = result.filter((walker) => matchesDogSizes(walker, filters.dogSizes));
  result = result.filter((walker) => matchesAvailability(walker, filters.availability));
  result = result.filter((walker) => matchesRating(walker, filters.rating));
  result = result.filter((walker) => matchesDistance(walker, filters.distance));

  if (filters.serviceTypes.length > 0) {
    result = result.filter(
      (walker) => walker.serviceType && filters.serviceTypes.includes(walker.serviceType)
    );
  }

  if (filters.verifiedOnly) {
    result = result.filter((walker) => walker.verified);
  }

  if (filters.priceRange === 'economy') {
    result = result.filter((walker) => walker.price < 12000);
  } else if (filters.priceRange === 'standard') {
    result = result.filter((walker) => walker.price >= 12000 && walker.price <= 16000);
  } else if (filters.priceRange === 'premium') {
    result = result.filter((walker) => walker.price > 16000);
  }

  const sortByRating = filters.sortBy === 'rating' || filters.rating === 'highest';

  if (sortByRating) {
    result.sort((a, b) => b.rating - a.rating || a.distance - b.distance);
  } else {
    result.sort((a, b) => a.distance - b.distance);
  }

  return result;
}

export function countActiveFilters(filters: WalkerFilterState): number {
  let count = 0;
  if (filters.petType) count++;
  if (filters.dogSizes.length > 0) count++;
  if (filters.availability) count++;
  if (filters.rating && filters.rating !== 'highest') count++;
  if (filters.rating === 'highest') count++;
  if (filters.distance) count++;
  if (filters.serviceTypes.length > 0) count++;
  if (filters.verifiedOnly) count++;
  if (filters.priceRange) count++;
  if (filters.sortBy === 'rating' && filters.rating !== 'highest') count++;
  return count;
}

export function isQuickFilterActive(filters: WalkerFilterState, id: QuickFilterId): boolean {
  switch (id) {
    case 'nearby':
      return filters.distance === 'near' || filters.distance === 1;
    case 'top-rated':
      return filters.rating === '4.5+' || filters.rating === 'highest' || filters.sortBy === 'rating';
    case 'available-now':
      return filters.availability === 'now';
    default:
      return false;
  }
}

export function toggleQuickFilter(
  filters: WalkerFilterState,
  id: QuickFilterId
): WalkerFilterState {
  switch (id) {
    case 'nearby':
      return {
        ...filters,
        distance: filters.distance === 'near' ? null : 'near',
      };
    case 'top-rated':
      if (filters.rating === '4.5+' || filters.rating === 'highest') {
        return { ...filters, rating: null, sortBy: 'distance' };
      }
      return { ...filters, rating: '4.5+', sortBy: 'rating' };
    case 'available-now':
      return {
        ...filters,
        availability: filters.availability === 'now' ? null : 'now',
      };
    default:
      return filters;
  }
}

export function clearWalkerFilters(): WalkerFilterState {
  return { ...DEFAULT_WALKER_FILTERS };
}

export function filtersAreDefault(filters: WalkerFilterState): boolean {
  return countActiveFilters(filters) === 0 && filters.sortBy === DEFAULT_WALKER_FILTERS.sortBy;
}
