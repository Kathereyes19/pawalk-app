import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  CheckCircle2,
  Clock,
  Heart,
  Home,
  Moon,
  PawPrint,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import type {
  CaregiversCategoryFilters,
  CategoryFiltersMap,
  CategoryQuickFilterId,
  HomeServiceCategory,
  VeterinaryCategoryFilters,
  WalkersCategoryFilters,
} from '@/types/homeDiscovery';
import { HomeFilterPanel } from '../home/HomeFilterPanel';

interface CategoryFilterSheetProps {
  open: boolean;
  category: HomeServiceCategory;
  draft: CategoryFiltersMap[HomeServiceCategory];
  onDraftChange: (draft: CategoryFiltersMap[HomeServiceCategory]) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
  isApplying: boolean;
  resultCount: number;
  activeFilterCount: number;
  isQuickFilterActive: (id: CategoryQuickFilterId) => boolean;
  onQuickFilterToggle: (id: CategoryQuickFilterId) => void;
}

function ChipButton({
  active,
  onClick,
  children,
  className = '',
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`rounded-xl border-2 text-sm font-medium transition-all ${className} ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background hover:border-primary/30'
      }`}
    >
      {children}
    </motion.button>
  );
}

function DistanceSection({
  distance,
  onChange,
}: {
  distance: WalkersCategoryFilters['distance'];
  onChange: (distance: WalkersCategoryFilters['distance']) => void;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Distancia</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { value: 'near' as const, label: 'Cerca de mí' },
          { value: 1 as const, label: 'Hasta 1 km' },
          { value: 3 as const, label: 'Hasta 3 km' },
          { value: 5 as const, label: 'Hasta 5 km' },
        ].map((option) => (
          <ChipButton
            key={String(option.value)}
            active={distance === option.value}
            onClick={() => onChange(distance === option.value ? null : option.value)}
            className="px-3 py-3"
          >
            {option.label}
          </ChipButton>
        ))}
      </div>
    </section>
  );
}

function PetTypeSection({
  petType,
  onChange,
}: {
  petType: WalkersCategoryFilters['petType'];
  onChange: (petType: WalkersCategoryFilters['petType']) => void;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <PawPrint className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Mascotas</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: 'dog' as const, label: 'Perros', icon: '🐕' },
          { value: 'cat' as const, label: 'Gatos', icon: '🐈' },
          { value: 'both' as const, label: 'Ambos', icon: '🐾' },
        ].map((option) => (
          <ChipButton
            key={option.value}
            active={petType === option.value}
            onClick={() => onChange(petType === option.value ? null : option.value)}
            className="px-3 py-3 text-center"
          >
            <span className="text-xl block mb-1">{option.icon}</span>
            <span className="text-xs">{option.label}</span>
          </ChipButton>
        ))}
      </div>
    </section>
  );
}

function WalkersFilters({
  draft,
  onDraftChange,
}: {
  draft: WalkersCategoryFilters;
  onDraftChange: (draft: WalkersCategoryFilters) => void;
}) {
  const update = (patch: Partial<WalkersCategoryFilters>) =>
    onDraftChange({ ...draft, ...patch });

  return (
    <>
      <PetTypeSection petType={draft.petType} onChange={(petType) => update({ petType })} />

      <section>
        <div className="flex items-center gap-2 mb-3">
          <PawPrint className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Tamaño de perro</h3>
        </div>
        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <ChipButton
              key={size}
              active={draft.dogSizes.includes(size)}
              onClick={() =>
                update({
                  dogSizes: draft.dogSizes.includes(size)
                    ? draft.dogSizes.filter((entry) => entry !== size)
                    : [...draft.dogSizes, size],
                })
              }
              className="flex-1 px-3 py-3 capitalize"
            >
              {size === 'small' ? 'Pequeño' : size === 'medium' ? 'Mediano' : 'Grande'}
            </ChipButton>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Duración del paseo</h3>
        </div>
        <div className="flex gap-2">
          {([30, 60, 90] as const).map((duration) => (
            <ChipButton
              key={duration}
              active={draft.walkDurations.includes(duration)}
              onClick={() =>
                update({
                  walkDurations: draft.walkDurations.includes(duration)
                    ? draft.walkDurations.filter((entry) => entry !== duration)
                    : [...draft.walkDurations, duration],
                })
              }
              className="flex-1 px-3 py-3"
            >
              {duration} min
            </ChipButton>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Disponibilidad</h3>
        </div>
        <ChipButton
          active={draft.availableNow}
          onClick={() => update({ availableNow: !draft.availableNow })}
          className="w-full px-3 py-3"
        >
          Disponibles ahora
        </ChipButton>
      </section>

      <DistanceSection distance={draft.distance} onChange={(distance) => update({ distance })} />
    </>
  );
}

function CaregiversFilters({
  draft,
  onDraftChange,
}: {
  draft: CaregiversCategoryFilters;
  onDraftChange: (draft: CaregiversCategoryFilters) => void;
}) {
  const update = (patch: Partial<CaregiversCategoryFilters>) =>
    onDraftChange({ ...draft, ...patch });

  return (
    <>
      <PetTypeSection petType={draft.petType} onChange={(petType) => update({ petType })} />

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Tipo de cuidado</h3>
        </div>
        <div className="space-y-2">
          {[
            { key: 'overnightCare' as const, label: 'Cuidado nocturno', icon: Moon },
            { key: 'inHomeCare' as const, label: 'Cuidado en casa', icon: Home },
            { key: 'multiPet' as const, label: 'Multi-mascota', icon: PawPrint },
          ].map((option) => {
            const Icon = option.icon;
            const active = draft[option.key];
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => update({ [option.key]: !active })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                  active
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:border-primary/30'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`flex-1 text-left font-medium ${active ? 'text-primary' : ''}`}>
                  {option.label}
                </span>
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                    active ? 'border-primary bg-primary' : 'border-border'
                  }`}
                >
                  {active && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Experiencia mínima</h3>
        </div>
        <div className="flex gap-2">
          {[
            { value: 3 as const, label: '3+ años' },
            { value: 5 as const, label: '5+ años' },
            { value: 8 as const, label: '8+ años' },
          ].map((option) => (
            <ChipButton
              key={option.value}
              active={draft.experienceMin === option.value}
              onClick={() =>
                update({
                  experienceMin: draft.experienceMin === option.value ? null : option.value,
                })
              }
              className="flex-1 px-2 py-3 text-xs"
            >
              {option.label}
            </ChipButton>
          ))}
        </div>
      </section>

      <DistanceSection distance={draft.distance} onChange={(distance) => update({ distance })} />
    </>
  );
}

function VeterinaryFilters({
  draft,
  onDraftChange,
}: {
  draft: VeterinaryCategoryFilters;
  onDraftChange: (draft: VeterinaryCategoryFilters) => void;
}) {
  const update = (patch: Partial<VeterinaryCategoryFilters>) =>
    onDraftChange({ ...draft, ...patch });

  return (
    <>
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Servicios</h3>
        </div>
        <div className="space-y-2">
          {[
            { key: 'openNow' as const, label: 'Abierto ahora', icon: Zap },
            { key: 'emergency' as const, label: 'Emergencias', icon: Heart },
            { key: 'vaccination' as const, label: 'Vacunación', icon: Sparkles },
            { key: 'grooming' as const, label: 'Grooming / Spa', icon: Sparkles },
          ].map((option) => {
            const Icon = option.icon;
            const active = draft[option.key];
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => update({ [option.key]: !active })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                  active
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:border-primary/30'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`flex-1 text-left font-medium ${active ? 'text-primary' : ''}`}>
                  {option.label}
                </span>
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                    active ? 'border-primary bg-primary' : 'border-border'
                  }`}
                >
                  {active && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <DistanceSection distance={draft.distance} onChange={(distance) => update({ distance })} />
    </>
  );
}

export const CategoryFilterSheet: React.FC<CategoryFilterSheetProps> = ({
  open,
  category,
  draft,
  onDraftChange,
  onApply,
  onClear,
  onClose,
  isApplying,
  resultCount,
  activeFilterCount,
  isQuickFilterActive,
  onQuickFilterToggle,
}) => {
  const categoryMeta = {
    walkers: 'Filtros de paseadores',
    caregivers: 'Filtros de cuidadores',
    veterinary: 'Filtros veterinarios',
  }[category];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl border-t border-border z-50 max-h-[88vh] flex flex-col md:bottom-auto md:top-1/2 md:left-1/2 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full md:rounded-2xl md:border"
          >
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <div>
                <h2 className="text-xl font-bold">{categoryMeta}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {resultCount} resultado{resultCount === 1 ? '' : 's'}
                </p>
              </div>
              <IconButton variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="md:hidden">
                <HomeFilterPanel
                  category={category}
                  activeFilterCount={activeFilterCount}
                  isQuickFilterActive={isQuickFilterActive}
                  onQuickFilterToggle={onQuickFilterToggle}
                  onOpenAdvanced={() => {}}
                  onClear={onClear}
                  variant="sheet"
                  showHeader
                  showAdvancedButton={false}
                />
              </div>

              <div className="md:hidden border-t border-border pt-2">
                <h3 className="text-sm font-semibold mb-4">Filtros avanzados</h3>
              </div>

              <div className="hidden md:block">
                <h3 className="text-sm font-semibold mb-4">Filtros avanzados</h3>
              </div>

              {category === 'walkers' && (
                <WalkersFilters
                  draft={draft as WalkersCategoryFilters}
                  onDraftChange={onDraftChange}
                />
              )}
              {category === 'caregivers' && (
                <CaregiversFilters
                  draft={draft as CaregiversCategoryFilters}
                  onDraftChange={onDraftChange}
                />
              )}
              {category === 'veterinary' && (
                <VeterinaryFilters
                  draft={draft as VeterinaryCategoryFilters}
                  onDraftChange={onDraftChange}
                />
              )}
            </div>

            <div className="p-5 pb-safe border-t border-border space-y-2 shrink-0 bg-card">
              <Button fullWidth size="lg" onClick={onApply} loading={isApplying} disabled={isApplying}>
                {!isApplying && (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Ver {resultCount} resultado{resultCount === 1 ? '' : 's'}
                  </>
                )}
              </Button>
              <Button fullWidth size="md" variant="ghost" onClick={onClear} disabled={isApplying}>
                Limpiar filtros de esta categoría
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
