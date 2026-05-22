import React from 'react';
import { Button } from '../Button';
import { ChipButton } from '../ChipButton';
import { Input } from '../Input';
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

interface MarketplaceFilterPanelProps {
  filters: MarketplaceFilters;
  priceBounds: { min: number; max: number };
  onChange: (patch: Partial<MarketplaceFilters>) => void;
  onReset: () => void;
  onApply?: () => void;
  variant?: 'sheet' | 'sidebar';
}

export const MarketplaceFilterPanel: React.FC<MarketplaceFilterPanelProps> = ({
  filters,
  priceBounds,
  onChange,
  onReset,
  onApply,
  variant = 'sheet',
}) => {
  const isSidebar = variant === 'sidebar';

  return (
    <>
      <div className={isSidebar ? 'p-4 space-y-5 flex-1 overflow-y-auto' : 'p-5 space-y-5 overflow-y-auto'}>
        <div>
          <p className="text-sm font-medium mb-2">Categoría</p>
          <div className={`grid gap-2 ${isSidebar ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
            onChange={(event) => onChange({ minPrice: Number(event.target.value) || 0 })}
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

      <div
        className={
          isSidebar
            ? 'p-4 border-t border-border space-y-2 shrink-0'
            : 'p-5 pb-safe border-t border-border grid grid-cols-2 gap-3'
        }
      >
        {isSidebar ? (
          <>
            <Button variant="outline" size="lg" fullWidth onClick={onReset}>
              Limpiar
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="lg" fullWidth onClick={onReset}>
              Limpiar
            </Button>
            <Button size="lg" fullWidth onClick={onApply}>
              Aplicar
            </Button>
          </>
        )}
      </div>
    </>
  );
};
