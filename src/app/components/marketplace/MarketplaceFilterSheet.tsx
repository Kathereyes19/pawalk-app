import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../Button';
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
              <IconButton variant="ghost" onClick={onClose}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              <div>
                <p className="text-sm font-medium mb-2">Categoría</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => onChange({ category: category.id })}
                      className={`rounded-2xl border px-3 py-2.5 text-left text-sm transition-all ${
                        filters.category === category.id
                          ? 'border-primary bg-primary/10 font-semibold'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <span className="mr-1">{category.emoji}</span>
                      {category.label}
                    </button>
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
                    <button
                      key={rating}
                      type="button"
                      onClick={() => onChange({ minRating: rating })}
                      className={`px-3 py-2 rounded-full text-sm border ${
                        filters.minRating === rating
                          ? 'border-primary bg-primary/10 font-semibold'
                          : 'border-border'
                      }`}
                    >
                      {rating === 0 ? 'Todas' : `${rating}+ ★`}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-2xl border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(event) => onChange({ inStockOnly: event.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm">Solo productos disponibles</span>
              </label>
            </div>

            <div className="p-5 pb-safe border-t border-border grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={onReset}>
                Limpiar
              </Button>
              <Button onClick={onClose}>Aplicar</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
