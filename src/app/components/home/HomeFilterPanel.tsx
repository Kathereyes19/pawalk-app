import React from 'react';
import {
  SlidersHorizontal,
  X,
  MapPin,
  Zap,
  Star,
  Moon,
  Home,
  Stethoscope,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../Button';
import type { CategoryQuickFilterId, HomeServiceCategory } from '@/types/homeDiscovery';
import { QUICK_FILTERS_BY_CATEGORY } from '@/types/homeDiscovery';

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

export interface HomeFilterPanelProps {
  category: HomeServiceCategory;
  activeFilterCount: number;
  resultCount?: number;
  isQuickFilterActive: (id: CategoryQuickFilterId) => boolean;
  onQuickFilterToggle: (id: CategoryQuickFilterId) => void;
  onOpenAdvanced: () => void;
  onClear: () => void;
  /** sidebar = desktop right panel; sheet = mobile filter sheet section */
  variant?: 'sidebar' | 'sheet';
  showHeader?: boolean;
  /** When false, hides the advanced-filters button (e.g. inside the full mobile sheet). */
  showAdvancedButton?: boolean;
}

export const HomeFilterPanel: React.FC<HomeFilterPanelProps> = ({
  category,
  activeFilterCount,
  resultCount,
  isQuickFilterActive,
  onQuickFilterToggle,
  onOpenAdvanced,
  onClear,
  variant = 'sidebar',
  showHeader = true,
  showAdvancedButton = true,
}) => {
  const quickFilters = QUICK_FILTERS_BY_CATEGORY[category];
  const isSheet = variant === 'sheet';

  return (
    <div className={isSheet ? 'space-y-4' : 'flex flex-col flex-1 min-h-0'}>
      {showHeader && !isSheet && (
        <div className="p-5 border-b border-border shrink-0">
          <h2 className="font-bold text-base flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            Filtros
          </h2>
          {resultCount !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {resultCount} resultado{resultCount === 1 ? '' : 's'}
            </p>
          )}
        </div>
      )}

      {showHeader && isSheet && (
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            Filtros rápidos
          </h3>
        </div>
      )}

      <div className={isSheet ? 'space-y-2' : 'p-5 space-y-2 flex-1 overflow-y-auto'}>
        {!isSheet && (
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-1">
            Filtros rápidos
          </h3>
        )}
        {quickFilters.map((filter) => {
          const Icon = QUICK_FILTER_ICONS[filter.id];
          const isActive = isQuickFilterActive(filter.id);
          return (
            <motion.button
              key={filter.id}
              type="button"
              onClick={() => onQuickFilterToggle(filter.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{filter.label}</span>
              {isActive && <X className="w-3.5 h-3.5" />}
            </motion.button>
          );
        })}
      </div>

      <div
        className={
          isSheet
            ? 'space-y-2 pt-2'
            : 'p-5 border-t border-border space-y-2 shrink-0 bg-background'
        }
      >
        {showAdvancedButton && (
          <Button fullWidth variant="outline" size={isSheet ? 'md' : 'lg'} onClick={onOpenAdvanced}>
            Filtros avanzados
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
        {activeFilterCount > 0 && (
          <Button fullWidth variant="ghost" size="sm" onClick={onClear}>
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
};
