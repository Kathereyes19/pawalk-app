import { useCallback, useMemo, useState } from 'react';
import {
  clearCategoryFilters,
  countCategoryActiveFilters,
  filterDiscoveryProviders,
  isCategoryQuickFilterActive,
  toggleCategoryQuickFilter,
} from './filterWalkers';
import type { Walker } from '@/types';
import type {
  CategoryFiltersMap,
  CategoryQuickFilterId,
  HomeServiceCategory,
} from '@/types/homeDiscovery';
import { DEFAULT_CATEGORY_FILTERS } from '@/types/homeDiscovery';

export function useHomeDiscovery(providers: Walker[]) {
  const [category, setCategory] = useState<HomeServiceCategory>('walkers');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersByCategory, setFiltersByCategory] =
    useState<CategoryFiltersMap>(DEFAULT_CATEGORY_FILTERS);
  const [draftFilters, setDraftFilters] = useState<CategoryFiltersMap[HomeServiceCategory]>(
    DEFAULT_CATEGORY_FILTERS.walkers
  );
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const filters = filtersByCategory[category];

  const filteredProviders = useMemo(
    () => filterDiscoveryProviders(providers, category, filters, searchQuery),
    [providers, category, filters, searchQuery]
  );

  const filteredAvailableCount = useMemo(
    () => filteredProviders.filter((provider) => provider.available).length,
    [filteredProviders]
  );

  const activeFilterCount = useMemo(
    () => countCategoryActiveFilters(category, filters),
    [category, filters]
  );

  const setCategoryAndResetSelection = useCallback((next: HomeServiceCategory) => {
    setCategory(next);
  }, []);

  const openFilterSheet = useCallback(() => {
    setDraftFilters(filtersByCategory[category]);
    setShowFilterSheet(true);
  }, [category, filtersByCategory]);

  const closeFilterSheet = useCallback(() => {
    setShowFilterSheet(false);
  }, []);

  const applyDraftFilters = useCallback(() => {
    setIsApplying(true);
    setFiltersByCategory((current) => ({
      ...current,
      [category]: draftFilters,
    }));
    window.setTimeout(() => {
      setIsApplying(false);
      setShowFilterSheet(false);
    }, 300);
  }, [category, draftFilters]);

  const clearAllFilters = useCallback(() => {
    setFiltersByCategory((current) => ({
      ...current,
      [category]: clearCategoryFilters(category),
    }));
    setDraftFilters(clearCategoryFilters(category));
    setSearchQuery('');
  }, [category]);

  const handleQuickFilterToggle = useCallback(
    (id: CategoryQuickFilterId) => {
      setFiltersByCategory((current) => ({
        ...current,
        [category]: toggleCategoryQuickFilter(category, current[category], id),
      }));
    },
    [category]
  );

  const isQuickFilterActive = useCallback(
    (id: CategoryQuickFilterId) =>
      isCategoryQuickFilterActive(category, filtersByCategory[category], id),
    [category, filtersByCategory]
  );

  const draftResultCount = useMemo(
    () => filterDiscoveryProviders(providers, category, draftFilters, searchQuery).length,
    [providers, category, draftFilters, searchQuery]
  );

  return {
    category,
    setCategory: setCategoryAndResetSelection,
    searchQuery,
    setSearchQuery,
    filters,
    filtersByCategory,
    draftFilters,
    setDraftFilters,
    filteredProviders,
    filteredAvailableCount,
    activeFilterCount,
    showFilterSheet,
    isApplying,
    openFilterSheet,
    closeFilterSheet,
    applyDraftFilters,
    clearAllFilters,
    handleQuickFilterToggle,
    isQuickFilterActive,
    draftResultCount,
  };
}

/** @deprecated use useHomeDiscovery */
export function useWalkerFilters(walkers: Walker[]) {
  const discovery = useHomeDiscovery(walkers);
  return {
    ...discovery,
    filteredWalkers: discovery.filteredProviders,
    filters: discovery.filters,
    setFilters: () => {},
  };
}
