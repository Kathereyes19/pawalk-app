import { useCallback, useMemo, useState } from 'react';
import {
  clearWalkerFilters,
  countActiveFilters,
  filterWalkers,
  isQuickFilterActive,
  toggleQuickFilter,
} from './filterWalkers';
import type { Walker } from '@/types';
import type { QuickFilterId, WalkerFilterState } from '@/types/walkerFilters';
import { DEFAULT_WALKER_FILTERS } from '@/types/walkerFilters';

export function useWalkerFilters(walkers: Walker[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<WalkerFilterState>(DEFAULT_WALKER_FILTERS);
  const [draftFilters, setDraftFilters] = useState<WalkerFilterState>(DEFAULT_WALKER_FILTERS);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const filteredWalkers = useMemo(
    () => filterWalkers(walkers, filters, searchQuery),
    [walkers, filters, searchQuery]
  );

  const filteredAvailableCount = useMemo(
    () => filteredWalkers.filter((walker) => walker.available).length,
    [filteredWalkers]
  );

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const openFilterSheet = useCallback(() => {
    setDraftFilters(filters);
    setShowFilterSheet(true);
  }, [filters]);

  const closeFilterSheet = useCallback(() => {
    setShowFilterSheet(false);
  }, []);

  const applyDraftFilters = useCallback(() => {
    setIsApplying(true);
    setFilters(draftFilters);
    window.setTimeout(() => {
      setIsApplying(false);
      setShowFilterSheet(false);
    }, 350);
  }, [draftFilters]);

  const clearAllFilters = useCallback(() => {
    const empty = clearWalkerFilters();
    setFilters(empty);
    setDraftFilters(empty);
    setSearchQuery('');
  }, []);

  const handleQuickFilterToggle = useCallback((id: QuickFilterId) => {
    setFilters((current) => toggleQuickFilter(current, id));
  }, []);

  const checkQuickFilterActive = useCallback(
    (id: QuickFilterId) => isQuickFilterActive(filters, id),
    [filters]
  );

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    draftFilters,
    setDraftFilters,
    filteredWalkers,
    filteredAvailableCount,
    activeFilterCount,
    showFilterSheet,
    isApplying,
    openFilterSheet,
    closeFilterSheet,
    applyDraftFilters,
    clearAllFilters,
    handleQuickFilterToggle,
    isQuickFilterActive: checkQuickFilterActive,
  };
}
