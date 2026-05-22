import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../Button';
import { ChipButton } from '../ChipButton';
import { Input } from '../Input';
import { IconButton } from '../IconButton';
import type { MarketplaceCategory, MarketplaceFilters } from '@/types';

const CATEGORIES: Array<{ id: MarketplaceCategory | 'all'; label: string; emoji: string }> = [
  { id: 'all', label: 'Todos', emoji: '🛍️' },
  { id: 'food', label: 'Alimento', emoji: '🍽️' },
  { id: 'grooming', label: 'Aseo', emoji: '✂️' },
  { id: 'toys', label: 'Juguetes', emoji: '🎾' },
  { id: 'veterinary', label: 'Veterinaria', emoji: '💊' },
  { id: 'services', label: 'Servicios', emoji: '✨' },
];

const RATING_OPTIONS = [0, 3, 4, 4.5];

interface MarketplaceFilterSheetProps {
  open: boolean;
  filters: MarketplaceFilters;
  priceBounds: { min: number; max: number };
  onClose: () => void;
  onChange: (patch: Partial<MarketplaceFilters>) => void;
  onReset: () => void;
}

export const MarketplaceFilterSheet: React.FC<MarketplaceFilterSheetProps> = ({
  open,
  filters,
  priceBounds,
  onClose,
  onChange,
  onReset,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute bottom-0 left-0 right-0 max-h-[88vh] bg-card rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Filtros</h2>
              </div>
              <IconButton variant="ghost" onClick={onClose} aria-label="Cerrar filtros">
                <X className="w-5 h-5" />
              </IconButton>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              <div>
                <p className="text-sm font-medium mb-2">Categoría</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <ChipButton
                      key={category.id}
                      active={filters.category === category.id}
                      onClick={() => onChange({ category: category.id })}
                      className="w-full justify-start px-4"
                    >
                      <span aria-hidden>{category.emoji}</span>
                      {category.label}
                    </ChipButton>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Precio mín."
                  type="number"
                  value={String(filters.minPrice)}
                  onChange={(event) =>
                    onChange({ minPrice: Number(event.target.value) || 0 })
                  }
                />
                <Input
                  label="Precio máx."
                  type="number"
                  value={String(filters.maxPrice)}
                  onChange={(event) =>
                    onChange({
                      maxPrice: Number(event.target.value) || priceBounds.max,
                    })
                  }
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Calificación mínima</p>
                <div className="flex flex-wrap gap-2">
                  {RATING_OPTIONS.map((rating) => (
                    <ChipButton
                      key={rating}
                      size="sm"
                      active={filters.minRating === rating}
                      onClick={() => onChange({ minRating: rating })}
                    >
                      {rating === 0 ? 'Todas' : `${rating}+ ★`}
                    </ChipButton>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-full border-2 border-border cursor-pointer hover:border-primary/30 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(event) => onChange({ inStockOnly: event.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium">Solo productos disponibles</span>
              </label>
            </div>

            <div className="p-5 pb-safe border-t border-border grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" fullWidth onClick={onReset}>
                Limpiar
              </Button>
              <Button size="lg" fullWidth onClick={onClose}>
                Aplicar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
