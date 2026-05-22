import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Check,
  CheckCircle2,
  DollarSign,
  PawPrint,
  Shield,
  Sparkles,
  Star,
  Target,
  Verified,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { SERVICE_TYPE_OPTIONS } from '@/types/walkerFilters';
import type { WalkerFilterState } from '@/types/walkerFilters';

interface WalkerFilterSheetProps {
  open: boolean;
  draft: WalkerFilterState;
  onDraftChange: (draft: WalkerFilterState) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
  isApplying: boolean;
  resultCount: number;
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

export const WalkerFilterSheet: React.FC<WalkerFilterSheetProps> = ({
  open,
  draft,
  onDraftChange,
  onApply,
  onClear,
  onClose,
  isApplying,
  resultCount,
}) => {
  const update = (patch: Partial<WalkerFilterState>) => {
    onDraftChange({ ...draft, ...patch });
  };

  const toggleDogSize = (size: 'small' | 'medium' | 'large') => {
    const next = draft.dogSizes.includes(size)
      ? draft.dogSizes.filter((entry) => entry !== size)
      : [...draft.dogSizes, size];
    update({ dogSizes: next });
  };

  const toggleService = (value: WalkerFilterState['serviceTypes'][number]) => {
    const next = draft.serviceTypes.includes(value)
      ? draft.serviceTypes.filter((entry) => entry !== value)
      : [...draft.serviceTypes, value];
    update({ serviceTypes: next });
  };

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
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl border-t border-border z-50 max-h-[88vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <div>
                <h2 className="text-xl font-bold">Filtros</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {resultCount} resultado{resultCount === 1 ? '' : 's'} con estos filtros
                </p>
              </div>
              <IconButton variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <PawPrint className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Tipo de mascota</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'dog' as const, label: 'Perros', icon: '🐕' },
                    { value: 'cat' as const, label: 'Gatos', icon: '🐈' },
                    { value: 'both' as const, label: 'Ambos', icon: '🐾' },
                  ].map((option) => (
                    <ChipButton
                      key={option.value}
                      active={draft.petType === option.value}
                      onClick={() =>
                        update({
                          petType: draft.petType === option.value ? null : option.value,
                        })
                      }
                      className="px-3 py-3 text-center"
                    >
                      <span className="text-xl block mb-1">{option.icon}</span>
                      <span className="text-xs">{option.label}</span>
                    </ChipButton>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Tamaño de perro</h3>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: 'small' as const, label: 'Pequeño' },
                    { value: 'medium' as const, label: 'Mediano' },
                    { value: 'large' as const, label: 'Grande' },
                  ].map((option) => (
                    <ChipButton
                      key={option.value}
                      active={draft.dogSizes.includes(option.value)}
                      onClick={() => toggleDogSize(option.value)}
                      className="flex-1 px-3 py-3"
                    >
                      {option.label}
                    </ChipButton>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Disponibilidad</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'now' as const, label: 'Ahora', icon: Zap },
                    { value: 'today' as const, label: 'Hoy', icon: Calendar },
                    { value: 'tomorrow' as const, label: 'Mañana', icon: Calendar },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <ChipButton
                        key={option.value}
                        active={draft.availability === option.value}
                        onClick={() =>
                          update({
                            availability:
                              draft.availability === option.value ? null : option.value,
                          })
                        }
                        className="px-3 py-3 text-center"
                      >
                        <Icon className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">{option.label}</span>
                      </ChipButton>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Calificación</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'highest' as const, label: 'Mejor valorados' },
                    { value: '4.5+' as const, label: '4.5+ estrellas' },
                    { value: '5' as const, label: '5 estrellas' },
                  ].map((option) => (
                    <ChipButton
                      key={option.value}
                      active={draft.rating === option.value}
                      onClick={() =>
                        update({
                          rating: draft.rating === option.value ? null : option.value,
                          sortBy: option.value === 'highest' ? 'rating' : draft.sortBy,
                        })
                      }
                      className="px-2 py-3 text-center text-xs"
                    >
                      {option.label}
                    </ChipButton>
                  ))}
                </div>
              </section>

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
                      active={draft.distance === option.value}
                      onClick={() =>
                        update({
                          distance: draft.distance === option.value ? null : option.value,
                        })
                      }
                      className="px-3 py-3"
                    >
                      {option.label}
                    </ChipButton>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Servicios</h3>
                </div>
                <div className="space-y-2">
                  {SERVICE_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleService(option.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                        draft.serviceTypes.includes(option.value)
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background hover:border-primary/30'
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span
                        className={`flex-1 text-left font-medium ${
                          draft.serviceTypes.includes(option.value) ? 'text-primary' : ''
                        }`}
                      >
                        {option.label}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                          draft.serviceTypes.includes(option.value)
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}
                      >
                        {draft.serviceTypes.includes(option.value) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Rango de precio</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'economy' as const, label: 'Económico', desc: 'Hasta $12,000' },
                    { value: 'standard' as const, label: 'Estándar', desc: '$12,000 - $16,000' },
                    { value: 'premium' as const, label: 'Premium', desc: 'Más de $16,000' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        update({
                          priceRange: draft.priceRange === option.value ? null : option.value,
                        })
                      }
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                        draft.priceRange === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background hover:border-primary/30'
                      }`}
                    >
                      <div className="text-left">
                        <p
                          className={`font-medium ${
                            draft.priceRange === option.value ? 'text-primary' : ''
                          }`}
                        >
                          {option.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          draft.priceRange === option.value
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}
                      >
                        {draft.priceRange === option.value && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Verificación</h3>
                </div>
                <button
                  type="button"
                  onClick={() => update({ verifiedOnly: !draft.verifiedOnly })}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                    draft.verifiedOnly
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Verified
                      className={`w-5 h-5 ${
                        draft.verifiedOnly ? 'text-primary fill-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <div className="text-left">
                      <p className={`font-medium ${draft.verifiedOnly ? 'text-primary' : ''}`}>
                        Solo verificados
                      </p>
                      <p className="text-xs text-muted-foreground">Identidad confirmada</p>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full transition-all ${
                      draft.verifiedOnly ? 'bg-primary' : 'bg-border'
                    } relative`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{ x: draft.verifiedOnly ? 26 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </button>
              </section>
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
                Limpiar todos los filtros
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
