import React, { useEffect, useRef, useState } from 'react';
import {
  SlidersHorizontal,
  Star,
  MapPin,
  Verified,
  Navigation,
  Clock,
  Zap,
  X,
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
import { WalkerAvailabilityBadge } from '../components/walker/WalkerAvailabilityBadge';
import { WalkerFilterSheet } from '../components/walker/WalkerFilterSheet';
import { MOCK_WALKERS, nudgeWalkerPosition } from '@/lib/walkers/mockWalkers';
import { useWalkerFilters } from '@/lib/walkers/useWalkerFilters';
import { filterWalkers } from '@/lib/walkers/filterWalkers';
import { QUICK_FILTER_OPTIONS } from '@/types/walkerFilters';
import type { QuickFilterId, Walker } from '@/types';

const QUICK_FILTER_ICONS: Record<QuickFilterId, React.ElementType> = {
  nearby: MapPin,
  'top-rated': Star,
  'available-now': Zap,
};

interface HomeScreenProps {
  onWalkerClick: (walker: Walker) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onWalkerClick }) => {
  const { t } = useLanguage();
  const [selectedWalker, setSelectedWalker] = useState<Walker | null>(null);
  const [liveWalkers, setLiveWalkers] = useState<Walker[]>([]);
  const tickRef = useRef(0);

  const {
    searchQuery,
    setSearchQuery,
    filters,
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
    isQuickFilterActive,
  } = useWalkerFilters(liveWalkers);

  useEffect(() => {
    setLiveWalkers(MOCK_WALKERS);

    const interval = window.setInterval(() => {
      tickRef.current += 1;
      setLiveWalkers((prev) =>
        prev.map((walker, index) => ({
          ...walker,
          position: nudgeWalkerPosition(walker.position, tickRef.current + index),
        }))
      );
    }, 8000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedWalker && !filteredWalkers.some((walker) => walker.id === selectedWalker.id)) {
      setSelectedWalker(null);
    }
  }, [filteredWalkers, selectedWalker]);

  const draftResultCount = filterWalkers(liveWalkers, draftFilters, searchQuery).length;

  return (
    <div className="h-full flex flex-col bg-background-secondary overflow-hidden">
      <div className="relative h-[360px] overflow-hidden shrink-0">
        <HomeMapCanvas
          walkers={filteredWalkers}
          selectedWalkerId={selectedWalker?.id}
          onSelectWalker={setSelectedWalker}
          availableCount={filteredAvailableCount}
          totalCount={filteredWalkers.length}
        />

        <div className="absolute top-4 left-4 right-4 z-30">
          <SearchBar
            placeholder={t('home.search')}
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
          {QUICK_FILTER_OPTIONS.map((filter) => {
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
          <h2 className="text-lg font-bold">{t('home.nearby')}</h2>
          <p className="text-sm text-muted-foreground">
            {filteredWalkers.length} paseador{filteredWalkers.length === 1 ? '' : 'es'}{' '}
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
          ) : filteredWalkers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">No hay resultados</h3>
              <p className="text-muted-foreground mb-4">Intenta ajustar tus filtros o búsqueda</p>
              <Button variant="outline" onClick={clearAllFilters}>
                Limpiar filtros
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              {filteredWalkers.map((walker, index) => (
                <motion.div
                  key={walker.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  layout
                >
                  <Card
                    onClick={() => onWalkerClick(walker)}
                    hoverable
                    variant="elevated"
                    className={`relative overflow-hidden ${!walker.available ? 'opacity-95' : ''}`}
                  >
                    <div className="flex gap-4">
                      <div className="relative shrink-0">
                        <Avatar emoji={walker.avatar} size="xl" />
                        <span
                          className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${
                            walker.available ? 'bg-success' : 'bg-muted-foreground/50'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-semibold text-base truncate">{walker.name}</h3>
                            {walker.verified && (
                              <Verified className="w-4 h-4 text-primary fill-primary shrink-0" />
                            )}
                          </div>
                          <WalkerAvailabilityBadge walker={walker} size="sm" />
                        </div>

                        <div className="flex items-center gap-3 text-sm mb-2.5 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-secondary text-secondary" />
                            <span className="font-semibold text-foreground">{walker.rating}</span>
                            <span className="text-xs text-muted-foreground">({walker.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{walker.distance} km</span>
                          </div>
                          {walker.available && walker.responseTime <= 3 && (
                            <Badge variant="warning" size="sm">
                              <Zap className="w-3 h-3" />
                              Rápido
                            </Badge>
                          )}
                          {walker.available && walker.responseTime > 3 && (
                            <div className="flex items-center gap-1 text-success">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">~{walker.responseTime} min</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="success" size="sm">
                              {walker.experience} {t('walker.years')}
                            </Badge>
                            {walker.acceptedSpecies?.includes('cat') && (
                              <Badge size="sm">🐈 Gatos</Badge>
                            )}
                            {walker.acceptedSpecies?.includes('dog') && (
                              <Badge size="sm">🐕 Perros</Badge>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">{t('from')}</p>
                            <p className="font-bold text-primary text-lg">
                              ${walker.price.toLocaleString()}
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

      <WalkerFilterSheet
        open={showFilterSheet}
        draft={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={applyDraftFilters}
        onClear={clearAllFilters}
        onClose={closeFilterSheet}
        isApplying={isApplying}
        resultCount={draftResultCount}
      />

      <AnimatePresence>
        {selectedWalker && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-20 left-0 right-0 bg-card rounded-t-3xl shadow-2xl border-t border-border p-4 pb-6 z-40"
            onClick={() => setSelectedWalker(null)}
          >
            <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar emoji={selectedWalker.avatar} size="xl" />
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${
                    selectedWalker.available ? 'bg-success' : 'bg-muted-foreground/50'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">{selectedWalker.name}</h3>
                  {selectedWalker.verified && (
                    <Verified className="w-4 h-4 text-primary fill-primary shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span className="font-semibold">{selectedWalker.rating}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{selectedWalker.distance} km</span>
                  {selectedWalker.available && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-success font-medium">
                        ~{selectedWalker.responseTime} min
                      </span>
                    </>
                  )}
                </div>
                <WalkerAvailabilityBadge walker={selectedWalker} size="md" />
              </div>
              <Button
                size="sm"
                variant={selectedWalker.available ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  onWalkerClick(selectedWalker);
                }}
              >
                {selectedWalker.available ? 'Reservar' : 'Agendar'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
