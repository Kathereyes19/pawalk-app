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

interface HomeFilterSidebarProps {
  category: HomeServiceCategory;
  activeFilterCount: number;
  resultCount: number;
  isQuickFilterActive: (id: CategoryQuickFilterId) => boolean;
  onQuickFilterToggle: (id: CategoryQuickFilterId) => void;
  onOpenAdvanced: () => void;
  onClear: () => void;
}

export const HomeFilterSidebar: React.FC<HomeFilterSidebarProps> = ({
  category,
  activeFilterCount,
  resultCount,
  isQuickFilterActive,
  onQuickFilterToggle,
  onOpenAdvanced,
  onClear,
}) => {
  const quickFilters = QUICK_FILTERS_BY_CATEGORY[category];

  return (
    <aside className="hidden md:flex md:flex-col md:h-full md:border-r md:border-border md:bg-background md:overflow-y-auto md:col-start-1 md:row-start-1 md:row-span-2 lg:row-span-1">
      <div className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h2 className="font-bold text-base flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Filtros
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {resultCount} resultado{resultCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="p-4 space-y-2 flex-1">
        {quickFilters.map((filter) => {
          const Icon = QUICK_FILTER_ICONS[filter.id];
          const isActive = isQuickFilterActive(filter.id);
          return (
            <motion.button
              key={filter.id}
              type="button"
              onClick={() => onQuickFilterToggle(filter.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
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

      <div className="p-4 border-t border-border space-y-2 sticky bottom-0 bg-background">
        <Button fullWidth variant="outline" onClick={onOpenAdvanced}>
          Filtros avanzados
          {activeFilterCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button fullWidth variant="ghost" size="sm" onClick={onClear}>
            Limpiar filtros
          </Button>
        )}
      </div>
    </aside>
  );
};
