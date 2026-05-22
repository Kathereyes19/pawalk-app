import React from 'react';
import { Navigation, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchBar } from '../SearchBar';
import { Card } from '../Card';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { HomeMapCanvas } from '../map/HomeMapCanvas';
import { HomeFilterSidebar } from './HomeFilterSidebar';
import { HomeWalkerGridCard } from './HomeWalkerGridCard';
import { HomeDesktopRightPanel } from './HomeDesktopRightPanel';
import type { HomeServiceCategory, Walker } from '@/types';
import type { CategoryQuickFilterId } from '@/types/homeDiscovery';

interface HomeDesktopDashboardProps {
  category: HomeServiceCategory;
  categoryTitle: string;
  categorySubtitle: string;
  searchPlaceholder: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  filteredProviders: Walker[];
  filteredAvailableCount: number;
  activeFilterCount: number;
  isApplying: boolean;
  selectedProviderId?: string | null;
  onSelectProvider: (provider: Walker | null) => void;
  onProviderClick: (provider: Walker) => void;
  isQuickFilterActive: (id: CategoryQuickFilterId) => boolean;
  onQuickFilterToggle: (id: CategoryQuickFilterId) => void;
  onOpenAdvanced: () => void;
  onClearFilters: () => void;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: string;
  yearsLabel: string;
  fromLabel: string;
}

export const HomeDesktopDashboard: React.FC<HomeDesktopDashboardProps> = ({
  category,
  categoryTitle,
  categorySubtitle,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  onSearchClear,
  filteredProviders,
  filteredAvailableCount,
  activeFilterCount,
  isApplying,
  selectedProviderId,
  onSelectProvider,
  onProviderClick,
  isQuickFilterActive,
  onQuickFilterToggle,
  onOpenAdvanced,
  onClearFilters,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  yearsLabel,
  fromLabel,
}) => (
  <div className="hidden md:grid md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_340px] xl:grid-cols-[260px_minmax(0,1fr)_380px] flex-1 min-h-0 overflow-hidden">
    <HomeFilterSidebar
      category={category}
      activeFilterCount={activeFilterCount}
      resultCount={filteredProviders.length}
      isQuickFilterActive={isQuickFilterActive}
      onQuickFilterToggle={onQuickFilterToggle}
      onOpenAdvanced={onOpenAdvanced}
      onClear={onClearFilters}
    />

    <div className="flex flex-col min-h-0 overflow-hidden md:col-start-2 lg:col-start-2">
      <div className="px-5 lg:px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">{categoryTitle}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{categorySubtitle}</p>
          </div>
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onOpenAdvanced}>
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </div>
        <SearchBar
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          onClear={onSearchClear}
          className="shadow-sm bg-card border border-border"
        />
      </div>

      <div className="relative flex-[1.15] min-h-[320px] lg:min-h-[380px] xl:min-h-[420px] max-h-[48vh] lg:max-h-[52vh] xl:max-h-none xl:flex-1 border-b border-border bg-muted/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.85 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <HomeMapCanvas
              walkers={filteredProviders}
              category={category}
              selectedWalkerId={selectedProviderId}
              onSelectWalker={onSelectProvider}
              availableCount={filteredAvailableCount}
              totalCount={filteredProviders.length}
            />
          </motion.div>
        </AnimatePresence>

        <IconButton
          variant="default"
          className="absolute bottom-5 right-5 z-20 shadow-lg bg-card/95 backdrop-blur-md"
          onClick={() => {}}
          aria-label="Centrar mapa"
        >
          <Navigation className="w-5 h-5 text-primary" />
        </IconButton>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-background-secondary/50">
        <div className="px-5 lg:px-6 py-4 flex items-center justify-between gap-3 sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div>
            <h2 className="font-semibold text-base">Proveedores cerca</h2>
            <p className="text-xs text-muted-foreground">
              {filteredProviders.length} resultado{filteredProviders.length === 1 ? '' : 's'} ·{' '}
              {filteredAvailableCount} disponibles
            </p>
          </div>
        </div>

        <div className="px-5 lg:px-6 py-4 pb-6">
          {isApplying ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="h-44 bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                {emptyIcon}
              </div>
              <h3 className="font-bold text-lg mb-2">{emptyTitle}</h3>
              <p className="text-muted-foreground mb-4 text-sm">{emptyDescription}</p>
              <Button variant="outline" onClick={onClearFilters}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProviders.map((provider, index) => (
                <HomeWalkerGridCard
                  key={provider.id}
                  provider={provider}
                  index={index}
                  yearsLabel={yearsLabel}
                  fromLabel={fromLabel}
                  onClick={() => onProviderClick(provider)}
                  onBook={() => onProviderClick(provider)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    <HomeDesktopRightPanel
      category={category}
      activeFilterCount={activeFilterCount}
      resultCount={filteredProviders.length}
      availableCount={filteredAvailableCount}
      providers={filteredProviders}
      isQuickFilterActive={isQuickFilterActive}
      onQuickFilterToggle={onQuickFilterToggle}
      onOpenAdvanced={onOpenAdvanced}
      onClear={onClearFilters}
      onProviderClick={onProviderClick}
    />
  </div>
);
