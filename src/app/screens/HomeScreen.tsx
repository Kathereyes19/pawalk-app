import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SlidersHorizontal,
  Star,
  MapPin,
  Verified,
  Navigation,
  Clock,
  TrendingUp,
  ChevronDown,
  Zap,
  Shield,
  X,
  Check,
  DollarSign,
  Target,
  Calendar,
  Sparkles,
  CheckCircle2,
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
import { MOCK_WALKERS, nudgeWalkerPosition } from '@/lib/walkers/mockWalkers';
import type { Walker } from '@/types';

interface FilterState {
  distance: '1km' | '3km' | '5km' | null;
  priceRange: 'economy' | 'standard' | 'premium' | null;
  rating: '4+' | '4.5+' | '5' | null;
  serviceType: string[];
  verifiedOnly: boolean;
  availability: 'now' | 'today' | 'week' | null;
}

interface HomeScreenProps {
  onWalkerClick: (walker: Walker) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onWalkerClick }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedWalker, setSelectedWalker] = useState<Walker | null>(null);
  const [liveWalkers, setLiveWalkers] = useState<Walker[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    distance: null,
    priceRange: null,
    rating: null,
    serviceType: [],
    verifiedOnly: false,
    availability: null,
  });
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const tickRef = useRef(0);

  const filterOptions = [
    { id: 'nearby', label: 'Cerca de ti', icon: MapPin },
    { id: 'top-rated', label: 'Mejor calificados', icon: Star },
    { id: 'fast', label: 'Más rápidos', icon: Zap },
    { id: 'verified', label: 'Verificados', icon: Shield },
  ];

  const applyFilters = (walkers: Walker[]): Walker[] => {
    let filtered = [...walkers];

    if (filters.distance) {
      const maxDistance = filters.distance === '1km' ? 1 : filters.distance === '3km' ? 3 : 5;
      filtered = filtered.filter((w) => w.distance <= maxDistance);
    }

    if (filters.priceRange) {
      if (filters.priceRange === 'economy') {
        filtered = filtered.filter((w) => w.price < 12000);
      } else if (filters.priceRange === 'standard') {
        filtered = filtered.filter((w) => w.price >= 12000 && w.price <= 16000);
      } else if (filters.priceRange === 'premium') {
        filtered = filtered.filter((w) => w.price > 16000);
      }
    }

    if (filters.rating) {
      const minRating = filters.rating === '4+' ? 4 : filters.rating === '4.5+' ? 4.5 : 5;
      filtered = filtered.filter((w) => w.rating >= minRating);
    }

    if (filters.serviceType.length > 0) {
      filtered = filtered.filter(
        (w) => w.serviceType && filters.serviceType.includes(w.serviceType)
      );
    }

    if (filters.verifiedOnly) {
      filtered = filtered.filter((w) => w.verified);
    }

    if (filters.availability === 'now') {
      filtered = filtered.filter((w) => w.available);
    }

    return filtered;
  };

  const filteredWalkers = useMemo(() => applyFilters(liveWalkers), [liveWalkers, filters]);
  const availableCount = useMemo(
    () => liveWalkers.filter((w) => w.available).length,
    [liveWalkers]
  );

  useEffect(() => {
    setLiveWalkers(MOCK_WALKERS);

    const interval = setInterval(() => {
      tickRef.current += 1;
      setLiveWalkers((prev) =>
        prev.map((walker, index) => ({
          ...walker,
          position: nudgeWalkerPosition(walker.position, tickRef.current + index),
        }))
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleOpenFilters = () => {
    setTempFilters(filters);
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    setIsApplyingFilters(true);
    setFilters(tempFilters);

    setTimeout(() => {
      setIsApplyingFilters(false);
      setShowFilterModal(false);
    }, 800);
  };

  const handleClearFilters = () => {
    const emptyFilters: FilterState = {
      distance: null,
      priceRange: null,
      rating: null,
      serviceType: [],
      verifiedOnly: false,
      availability: null,
    };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.distance) count++;
    if (filters.priceRange) count++;
    if (filters.rating) count++;
    if (filters.serviceType.length > 0) count++;
    if (filters.verifiedOnly) count++;
    if (filters.availability) count++;
    return count;
  };

  return (
    <div className="h-full flex flex-col bg-background-secondary overflow-hidden">
      <div className="relative h-[360px] overflow-hidden shrink-0">
        <HomeMapCanvas
          walkers={liveWalkers}
          selectedWalkerId={selectedWalker?.id}
          onSelectWalker={setSelectedWalker}
          availableCount={availableCount}
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

      {/* Filter Chips */}
      <div className="px-4 py-3 bg-background border-b border-border shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {filterOptions.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedFilters.includes(filter.id);
            return (
              <motion.button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
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

      {/* Results Header */}
      <div className="px-4 py-3 bg-background flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold">{t('home.nearby')}</h2>
          <p className="text-sm text-muted-foreground">
            {filteredWalkers.length} paseadores {getActiveFilterCount() > 0 ? 'encontrados' : 'cerca'}
          </p>
        </div>
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={handleOpenFilters}>
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          {getActiveFilterCount() > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white"
            >
              {getActiveFilterCount()}
            </motion.div>
          )}
        </div>
      </div>

      {/* Walker Cards */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 space-y-2.5">
        <AnimatePresence mode="wait">
          {isApplyingFilters ? (
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
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              {filteredWalkers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <SlidersHorizontal className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">No hay resultados</h3>
                  <p className="text-muted-foreground mb-4">
                    Intenta ajustar tus filtros
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                </motion.div>
              ) : (
                filteredWalkers
                  .sort((a, b) => a.distance - b.distance)
                  .map((walker, index) => (
            <motion.div
              key={walker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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

                    <div className="flex items-center gap-3 text-sm mb-2.5">
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

                    <div className="flex items-center justify-between">
                      <Badge variant="success" size="sm">
                        {walker.experience} {t('walker.years')}
                      </Badge>
                      <div className="text-right">
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
                  ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowFilterModal(false)}
            />

            {/* Filter Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl border-t border-border z-50 max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
                <div>
                  <h2 className="text-xl font-bold">Filtros</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Personaliza tu búsqueda
                  </p>
                </div>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilterModal(false)}
                >
                  <X className="w-5 h-5" />
                </IconButton>
              </div>

              {/* Filters Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Distance Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Distancia</h3>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { value: '1km', label: 'Menos de 1 km' },
                      { value: '3km', label: 'Menos de 3 km' },
                      { value: '5km', label: 'Menos de 5 km' },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() =>
                          setTempFilters({
                            ...tempFilters,
                            distance: tempFilters.distance === option.value ? null : option.value as any,
                          })
                        }
                        className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          tempFilters.distance === option.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background hover:border-primary/30'
                        }`}
                        whileTap={{ scale: 0.97 }}
                      >
                        {tempFilters.distance === option.value && (
                          <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                        )}
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Rango de precio</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'economy', label: 'Económico', desc: 'Hasta $12,000' },
                      { value: 'standard', label: 'Estándar', desc: '$12,000 - $16,000' },
                      { value: 'premium', label: 'Premium', desc: 'Más de $16,000' },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() =>
                          setTempFilters({
                            ...tempFilters,
                            priceRange: tempFilters.priceRange === option.value ? null : option.value as any,
                          })
                        }
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                          tempFilters.priceRange === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:border-primary/30'
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-left">
                          <p className={`font-medium ${tempFilters.priceRange === option.value ? 'text-primary' : ''}`}>
                            {option.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{option.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          tempFilters.priceRange === option.value
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}>
                          {tempFilters.priceRange === option.value && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Calificación mínima</h3>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { value: '4+', label: '4+', stars: 4 },
                      { value: '4.5+', label: '4.5+', stars: 4.5 },
                      { value: '5', label: '5', stars: 5 },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() =>
                          setTempFilters({
                            ...tempFilters,
                            rating: tempFilters.rating === option.value ? null : option.value as any,
                          })
                        }
                        className={`flex-1 px-4 py-3 rounded-xl border-2 text-center transition-all ${
                          tempFilters.rating === option.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background hover:border-primary/30'
                        }`}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className={`w-4 h-4 ${tempFilters.rating === option.value ? 'fill-primary' : 'fill-secondary text-secondary'}`} />
                          <span className="font-bold">{option.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">estrellas</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Service Type Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Tipo de servicio</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'dog-walking', label: 'Paseo de perros', icon: '🐕' },
                      { value: 'pet-sitting', label: 'Cuidado de mascotas', icon: '🏠' },
                      { value: 'grooming', label: 'Grooming / Spa', icon: '✨' },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => {
                          const newServiceTypes = tempFilters.serviceType.includes(option.value)
                            ? tempFilters.serviceType.filter((s) => s !== option.value)
                            : [...tempFilters.serviceType, option.value];
                          setTempFilters({ ...tempFilters, serviceType: newServiceTypes });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                          tempFilters.serviceType.includes(option.value)
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:border-primary/30'
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-2xl">{option.icon}</span>
                        <span className={`flex-1 text-left font-medium ${
                          tempFilters.serviceType.includes(option.value) ? 'text-primary' : ''
                        }`}>
                          {option.label}
                        </span>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                          tempFilters.serviceType.includes(option.value)
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}>
                          {tempFilters.serviceType.includes(option.value) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Verification Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Verificación</h3>
                  </div>
                  <motion.button
                    onClick={() =>
                      setTempFilters({
                        ...tempFilters,
                        verifiedOnly: !tempFilters.verifiedOnly,
                      })
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                      tempFilters.verifiedOnly
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-primary/30'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <Verified className={`w-5 h-5 ${tempFilters.verifiedOnly ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                      <div className="text-left">
                        <p className={`font-medium ${tempFilters.verifiedOnly ? 'text-primary' : ''}`}>
                          Solo paseadores verificados
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Con identidad confirmada
                        </p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-all ${
                      tempFilters.verifiedOnly ? 'bg-primary' : 'bg-border'
                    } relative`}>
                      <motion.div
                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                        animate={{ x: tempFilters.verifiedOnly ? 26 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </motion.button>
                </div>

                {/* Availability Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Disponibilidad</h3>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { value: 'now', label: 'Ahora', icon: Zap },
                      { value: 'today', label: 'Hoy', icon: Calendar },
                      { value: 'week', label: 'Esta semana', icon: TrendingUp },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() =>
                            setTempFilters({
                              ...tempFilters,
                              availability: tempFilters.availability === option.value ? null : option.value as any,
                            })
                          }
                          className={`flex-1 px-3 py-3 rounded-xl border-2 text-center transition-all ${
                            tempFilters.availability === option.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background hover:border-primary/30'
                          }`}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Icon className={`w-4 h-4 mx-auto mb-1 ${
                            tempFilters.availability === option.value ? '' : 'text-muted-foreground'
                          }`} />
                          <span className="text-xs font-medium">{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 pb-safe border-t border-border space-y-2 shrink-0 bg-card">
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleApplyFilters}
                  loading={isApplyingFilters}
                  disabled={isApplyingFilters}
                >
                  {!isApplyingFilters && (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Aplicar filtros
                    </>
                  )}
                </Button>
                <Button
                  fullWidth
                  size="md"
                  variant="ghost"
                  onClick={handleClearFilters}
                  disabled={isApplyingFilters}
                >
                  Limpiar todos los filtros
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Sheet for Selected Walker */}
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
            {/* Drag handle */}
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
