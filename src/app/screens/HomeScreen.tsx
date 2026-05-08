import React, { useState, useEffect } from 'react';
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

interface Walker {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  distance: number;
  price: number;
  verified: boolean;
  experience: number;
  available: boolean;
  responseTime: number; // in minutes
  position: { lat: number; lng: number };
  serviceType?: 'dog-walking' | 'pet-sitting' | 'grooming';
}

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

  const mockWalkers: Walker[] = [
    {
      id: '1',
      name: 'María González',
      avatar: '👩🏻',
      rating: 4.9,
      reviews: 127,
      distance: 0.8,
      price: 15000,
      verified: true,
      experience: 5,
      available: true,
      responseTime: 2,
      position: { lat: 3.4516, lng: -76.532 },
      serviceType: 'dog-walking',
    },
    {
      id: '2',
      name: 'Carlos Ramírez',
      avatar: '👨🏽',
      rating: 4.8,
      reviews: 89,
      distance: 1.2,
      price: 12000,
      verified: true,
      experience: 3,
      available: true,
      responseTime: 5,
      position: { lat: 3.4420, lng: -76.5225 },
      serviceType: 'dog-walking',
    },
    {
      id: '3',
      name: 'Laura Martínez',
      avatar: '👩🏼',
      rating: 5.0,
      reviews: 203,
      distance: 1.5,
      price: 18000,
      verified: true,
      experience: 7,
      available: false,
      responseTime: 10,
      position: { lat: 3.4370, lng: -76.5220 },
      serviceType: 'pet-sitting',
    },
    {
      id: '4',
      name: 'Juan Pérez',
      avatar: '👨🏻',
      rating: 4.7,
      reviews: 56,
      distance: 2.1,
      price: 10000,
      verified: true,
      experience: 2,
      available: true,
      responseTime: 3,
      position: { lat: 3.4300, lng: -76.5400 },
      serviceType: 'dog-walking',
    },
    {
      id: '5',
      name: 'Ana Silva',
      avatar: '👩🏽',
      rating: 4.95,
      reviews: 178,
      distance: 2.8,
      price: 16000,
      verified: false,
      experience: 4,
      available: true,
      responseTime: 7,
      position: { lat: 3.4250, lng: -76.5300 },
      serviceType: 'grooming',
    },
    {
      id: '6',
      name: 'Diego Morales',
      avatar: '👨🏼',
      rating: 4.6,
      reviews: 42,
      distance: 3.5,
      price: 9000,
      verified: true,
      experience: 1,
      available: true,
      responseTime: 12,
      position: { lat: 3.4150, lng: -76.5450 },
      serviceType: 'dog-walking',
    },
    {
      id: '7',
      name: 'Sofía Torres',
      avatar: '👩🏻',
      rating: 5.0,
      reviews: 312,
      distance: 4.2,
      price: 22000,
      verified: true,
      experience: 8,
      available: true,
      responseTime: 15,
      position: { lat: 3.4100, lng: -76.5500 },
      serviceType: 'pet-sitting',
    },
  ];

  const filterOptions = [
    { id: 'nearby', label: 'Cerca de ti', icon: MapPin },
    { id: 'top-rated', label: 'Mejor calificados', icon: Star },
    { id: 'fast', label: 'Más rápidos', icon: Zap },
    { id: 'verified', label: 'Verificados', icon: Shield },
  ];

  useEffect(() => {
    setLiveWalkers(mockWalkers);

    // Simulate live position updates
    const interval = setInterval(() => {
      setLiveWalkers((prev) =>
        prev.map((walker) => ({
          ...walker,
          position: {
            lat: walker.position.lat + (Math.random() - 0.5) * 0.0002,
            lng: walker.position.lng + (Math.random() - 0.5) * 0.0002,
          },
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  const applyFilters = (walkers: Walker[]): Walker[] => {
    let filtered = [...walkers];

    // Distance filter
    if (filters.distance) {
      const maxDistance = filters.distance === '1km' ? 1 : filters.distance === '3km' ? 3 : 5;
      filtered = filtered.filter((w) => w.distance <= maxDistance);
    }

    // Price range filter
    if (filters.priceRange) {
      if (filters.priceRange === 'economy') {
        filtered = filtered.filter((w) => w.price < 12000);
      } else if (filters.priceRange === 'standard') {
        filtered = filtered.filter((w) => w.price >= 12000 && w.price <= 16000);
      } else if (filters.priceRange === 'premium') {
        filtered = filtered.filter((w) => w.price > 16000);
      }
    }

    // Rating filter
    if (filters.rating) {
      const minRating = filters.rating === '4+' ? 4 : filters.rating === '4.5+' ? 4.5 : 5;
      filtered = filtered.filter((w) => w.rating >= minRating);
    }

    // Service type filter
    if (filters.serviceType.length > 0) {
      filtered = filtered.filter((w) =>
        w.serviceType && filters.serviceType.includes(w.serviceType)
      );
    }

    // Verified only filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter((w) => w.verified);
    }

    // Availability filter
    if (filters.availability === 'now') {
      filtered = filtered.filter((w) => w.available);
    }
    // For 'today' and 'week', we're simulating - in real app would check actual availability

    return filtered;
  };

  const handleOpenFilters = () => {
    setTempFilters(filters);
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    setIsApplyingFilters(true);
    setFilters(tempFilters);

    // Simulate loading
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

  const getWalkerPosition = (walker: Walker, index: number) => {
    // Calculate position based on simulated lat/lng
    const baseLeft = 15;
    const baseTop = 20;
    return {
      left: `${baseLeft + (index * 18) + (walker.position.lng % 20)}%`,
      top: `${baseTop + ((index % 2) * 25) + (walker.position.lat % 15)}%`,
    };
  };

  return (
    <div className="h-full flex flex-col bg-background-secondary overflow-hidden">
      {/* Enhanced Map Area */}
      <div className="relative h-[360px] overflow-hidden shrink-0">
        {/* Map Background with Grid Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-muted/10 to-muted/30">
          {/* Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Street Lines */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`street-${i}`}
              className="absolute h-0.5 bg-border/30"
              style={{
                width: '120%',
                left: '-10%',
                top: `${30 + i * 25}%`,
                transform: `rotate(${-5 + i * 2}deg)`,
              }}
            />
          ))}
        </div>

        {/* Your Location Pin */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <motion.div
            animate={{
              scale: [1, 1.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          >
            <div className="relative">
              <div className="w-16 h-16 bg-info rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-background">
                <Navigation className="w-8 h-8 text-white" />
              </div>
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 bg-info rounded-full"
                animate={{
                  scale: [1, 2],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Live Walker Pins */}
        <AnimatePresence>
          {liveWalkers.map((walker, index) => {
            const position = getWalkerPosition(walker, index);
            return (
              <motion.button
                key={walker.id}
                className="absolute z-10"
                style={position}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: index * 0.1, type: 'spring', bounce: 0.5 }}
                onClick={() => setSelectedWalker(walker)}
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  {/* Pin */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-background transition-all ${
                      walker.available
                        ? 'bg-primary'
                        : 'bg-muted opacity-60'
                    } ${selectedWalker?.id === walker.id ? 'ring-4 ring-primary/30' : ''}`}
                  >
                    <span className="text-2xl">{walker.avatar}</span>
                  </div>

                  {/* Active pulse */}
                  {walker.available && (
                    <motion.div
                      className="absolute inset-0 bg-primary rounded-full -z-10"
                      animate={{
                        scale: [1, 1.6],
                        opacity: [0.6, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: index * 0.3,
                      }}
                    />
                  )}

                  {/* Availability badge */}
                  {walker.available && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-white dark:border-background flex items-center justify-center">
                      <motion.div
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{
                          opacity: [1, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                      />
                    </div>
                  )}

                  {/* Price tooltip */}
                  {selectedWalker?.id === walker.id && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-card px-3 py-1.5 rounded-full shadow-lg border border-border whitespace-nowrap"
                    >
                      <span className="text-xs font-bold text-primary">
                        ${walker.price.toLocaleString()}
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-30">
          <SearchBar
            placeholder={t('home.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className="shadow-2xl backdrop-blur-md bg-card/95"
          />
        </div>

        {/* Recenter Button */}
        <IconButton
          variant="default"
          className="absolute bottom-4 right-4 z-30 shadow-xl bg-card/95 backdrop-blur-md"
          onClick={() => {}}
        >
          <Navigation className="w-5 h-5 text-primary" />
        </IconButton>

        {/* Live Counter */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-4 left-4 z-30 bg-card/95 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-border"
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-success rounded-full"
              animate={{
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
            <span className="text-sm font-semibold">
              {liveWalkers.filter((w) => w.available).length} disponibles
            </span>
          </div>
        </motion.div>
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
            {applyFilters(liveWalkers).length} paseadores {getActiveFilterCount() > 0 ? 'encontrados' : 'disponibles'}
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
              {applyFilters(liveWalkers).length === 0 ? (
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
                applyFilters(liveWalkers)
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
                className="relative overflow-hidden"
              >
                {!walker.available && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <Badge variant="default" size="sm">
                      No disponible
                    </Badge>
                  </div>
                )}

                <div className="flex gap-4">
                  {/* Avatar with online indicator */}
                  <div className="relative">
                    <Avatar emoji={walker.avatar} size="xl" />
                    {walker.available && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-card" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">
                        {walker.name}
                      </h3>
                      {walker.verified && (
                        <Verified className="w-4 h-4 text-primary fill-primary shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm mb-2.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-secondary text-secondary" />
                        <span className="font-semibold text-foreground">
                          {walker.rating}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({walker.reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {walker.distance} km
                        </span>
                      </div>
                      {walker.available && (
                        <div className="flex items-center gap-1 text-success">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">
                            ~{walker.responseTime} min
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="success" size="sm">
                        {walker.experience} {t('walker.years')}
                      </Badge>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {t('from')}
                        </p>
                        <p className="font-bold text-primary text-lg">
                          ${walker.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick book indicator */}
                {walker.available && walker.responseTime <= 3 && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="warning" size="sm" className="shadow-md">
                      <Zap className="w-3 h-3" />
                      Rápido
                    </Badge>
                  </div>
                )}
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
              <Avatar emoji={selectedWalker.avatar} size="xl" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{selectedWalker.name}</h3>
                  {selectedWalker.verified && (
                    <Verified className="w-4 h-4 text-primary fill-primary" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span className="font-semibold">{selectedWalker.rating}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {selectedWalker.distance} km
                  </span>
                  {selectedWalker.available && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-success font-medium">
                        ~{selectedWalker.responseTime} min
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onWalkerClick(selectedWalker);
                }}
              >
                Ver perfil
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
