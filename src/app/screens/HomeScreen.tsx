import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SlidersHorizontal,
  Star,
  MapPin,
  Verified,
  Navigation,
  Clock,
  Zap,
  X,
  Moon,
  Home,
  Stethoscope,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { SearchBar } from '../components/SearchBar';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { IconButton } from '../components/IconButton';
import { HomeMapCanvas } from '../components/map/HomeMapCanvas';
import { HomeCategoryTabs } from '../components/home/HomeCategoryTabs';
import { WalkerAvailabilityBadge } from '../components/walker/WalkerAvailabilityBadge';
import { CategoryFilterSheet } from '../components/walker/CategoryFilterSheet';
import { MOCK_WALKERS, nudgeWalkerPosition } from '@/lib/walkers/mockWalkers';
import { useHomeDiscovery } from '@/lib/walkers/useHomeDiscovery';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import { getWalkerAvatarProps } from '@/lib/images';
import {
  HOME_CATEGORIES,
  QUICK_FILTERS_BY_CATEGORY,
  type CategoryQuickFilterId,
} from '@/types/homeDiscovery';
import type { HomeServiceCategory, Walker } from '@/types';

const QUICK_FILTER_ICONS: Record<CategoryQuickFilterId, React.ElementType> = {
  nearby: MapPin,
  'available-now': Zap,
  'small-dogs': Star,
  overnight: Moon,
  'multi-pet': Home,
  experienced: Star,
  'open-now': Zap,
  emergency: Stethoscope,
  nearest: MapPin,
};

interface HomeScreenProps {
  onWalkerClick: (walker: Walker) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onWalkerClick }) => {
  const { t } = useLanguage();
  const [selectedProvider, setSelectedProvider] = useState<Walker | null>(null);
  const [liveProviders, setLiveProviders] = useState<Walker[]>([]);
  const tickRef = useRef(0);

  const {
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
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
  } = useHomeDiscovery(liveProviders);

  const categoryMeta = useMemo(
    () => HOME_CATEGORIES.find((entry) => entry.id === category) ?? HOME_CATEGORIES[0],
    [category]
  );

  const quickFilters = QUICK_FILTERS_BY_CATEGORY[category];

  useEffect(() => {
    setLiveProviders(MOCK_WALKERS);

    const interval = window.setInterval(() => {
      tickRef.current += 1;
      setLiveProviders((prev) =>
        prev.map((provider, index) => ({
          ...provider,
          position: nudgeWalkerPosition(provider.position, tickRef.current + index),
        }))
      );
    }, 8000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedProvider(null);
  }, [category]);

  useEffect(() => {
    if (
      selectedProvider &&
      !filteredProviders.some((provider) => provider.id === selectedProvider.id)
    ) {
      setSelectedProvider(null);
    }
  }, [filteredProviders, selectedProvider]);

  const handleCategoryChange = (next: HomeServiceCategory) => {
    setCategory(next);
  };

  return (
    <div className="h-full flex flex-col bg-background-secondary overflow-hidden">
      <HomeCategoryTabs activeCategory={category} onChange={handleCategoryChange} />

      <div className="relative h-[320px] overflow-hidden shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <HomeMapCanvas
              walkers={filteredProviders}
              category={category}
              selectedWalkerId={selectedProvider?.id}
              onSelectWalker={setSelectedProvider}
              availableCount={filteredAvailableCount}
              totalCount={filteredProviders.length}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-4 left-4 right-4 z-30">
          <SearchBar
            placeholder={
              category === 'veterinary'
                ? 'Buscar clínicas o veterinarios...'
                : category === 'caregivers'
                  ? 'Buscar cuidadores...'
                  : t('home.search')
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className="shadow-2xl backdrop-blur-md bg-card/95"
          />
        </div>

        <IconButton
          variant="default"
          className="absolute bottom-4 right-4 z-30 shadow-xl bg-card/95 backdrop-blur-md"
          onClick={() => {}}
          aria-label="Centrar mapa"
        >
          <Navigation className="w-5 h-5 text-primary" />
        </IconButton>
      </div>

      <div className="px-4 py-3 bg-background border-b border-border shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {quickFilters.map((filter) => {
            const Icon = QUICK_FILTER_ICONS[filter.id];
            const isActive = isQuickFilterActive(filter.id);
            return (
              <motion.button
                key={filter.id}
                type="button"
                onClick={() => handleQuickFilterToggle(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{filter.label}</span>
                {isActive && <X className="w-3.5 h-3.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3 bg-background flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold">{categoryMeta.resultsTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {filteredProviders.length} resultado{filteredProviders.length === 1 ? '' : 's'}{' '}
            {activeFilterCount > 0 || searchQuery ? 'encontrados' : 'cerca'}
          </p>
        </div>
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={openFilterSheet}>
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white"
            >
              {activeFilterCount}
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 space-y-2.5">
        <AnimatePresence mode="wait">
          {isApplying ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-28 bg-muted/30 animate-pulse" />
              ))}
            </motion.div>
          ) : filteredProviders.length === 0 ? (
            <motion.div
              key={`empty-${category}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                {categoryMeta.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{categoryMeta.emptyTitle}</h3>
              <p className="text-muted-foreground mb-4">{categoryMeta.emptyDescription}</p>
              <Button variant="outline" onClick={clearAllFilters}>
                Limpiar filtros
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={`results-${category}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              {filteredProviders.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  layout
                >
                  <Card
                    onClick={() => onWalkerClick(provider)}
                    hoverable
                    variant="elevated"
                    className={`relative overflow-hidden ${!provider.available ? 'opacity-95' : ''}`}
                  >
                    <div className="flex gap-4">
                      <div className="relative shrink-0">
                        <Avatar {...getWalkerAvatarProps(provider)} size="xl" />
                        <span
                          className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${
                            provider.available ? 'bg-success' : 'bg-muted-foreground/50'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-semibold text-base truncate">{provider.name}</h3>
                            {provider.verified && (
                              <Verified className="w-4 h-4 text-primary fill-primary shrink-0" />
                            )}
                          </div>
                          <WalkerAvailabilityBadge walker={provider} size="sm" />
                        </div>

                        <div className="flex items-center gap-3 text-sm mb-2.5 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-secondary text-secondary" />
                            <span className="font-semibold text-foreground">{provider.rating}</span>
                            <span className="text-xs text-muted-foreground">
                              ({provider.reviews})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{provider.distance} km</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {getWalkerHomeCategory(provider) === 'walkers' &&
                            provider.walkDurations?.slice(0, 2).map((duration) => (
                              <Badge key={duration} size="sm">
                                {duration} min
                              </Badge>
                            ))}
                          {getWalkerHomeCategory(provider) === 'caregivers' &&
                            provider.caregiverServices?.map((service) => (
                              <Badge key={service} size="sm">
                                {service === 'overnight'
                                  ? 'Nocturno'
                                  : service === 'in-home'
                                    ? 'En casa'
                                    : 'Multi-mascota'}
                              </Badge>
                            ))}
                          {getWalkerHomeCategory(provider) === 'veterinary' &&
                            provider.vetServices?.map((service) => (
                              <Badge key={service} size="sm">
                                {service === 'emergency'
                                  ? 'Emergencias'
                                  : service === 'vaccination'
                                    ? 'Vacunas'
                                    : 'Grooming'}
                              </Badge>
                            ))}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="success" size="sm">
                            {provider.experience} {t('walker.years')}
                          </Badge>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">{t('from')}</p>
                            <p className="font-bold text-primary text-lg">
                              ${provider.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CategoryFilterSheet
        open={showFilterSheet}
        category={category}
        draft={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={applyDraftFilters}
        onClear={clearAllFilters}
        onClose={closeFilterSheet}
        isApplying={isApplying}
        resultCount={draftResultCount}
      />

      <AnimatePresence>
        {selectedProvider && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-20 left-0 right-0 bg-card rounded-t-3xl shadow-2xl border-t border-border p-4 pb-6 z-40"
            onClick={() => setSelectedProvider(null)}
          >
            <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar {...getWalkerAvatarProps(selectedProvider)} size="xl" />
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${
                    selectedProvider.available ? 'bg-success' : 'bg-muted-foreground/50'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">{selectedProvider.name}</h3>
                  {selectedProvider.verified && (
                    <Verified className="w-4 h-4 text-primary fill-primary shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span className="font-semibold">{selectedProvider.rating}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{selectedProvider.distance} km</span>
                </div>
                <WalkerAvailabilityBadge walker={selectedProvider} size="md" />
              </div>
              <Button
                size="sm"
                variant={selectedProvider.available ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  onWalkerClick(selectedProvider);
                }}
              >
                {selectedProvider.available ? 'Reservar' : 'Agendar'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
