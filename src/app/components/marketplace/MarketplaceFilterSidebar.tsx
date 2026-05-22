import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { MarketplaceFilters } from '@/types';
import { MarketplaceFilterPanel } from './MarketplaceFilterPanel';

interface MarketplaceFilterSidebarProps {
  filters: MarketplaceFilters;
  priceBounds: { min: number; max: number };
  onChange: (patch: Partial<MarketplaceFilters>) => void;
  onReset: () => void;
  resultCount: number;
}

export const MarketplaceFilterSidebar: React.FC<MarketplaceFilterSidebarProps> = ({
  filters,
  priceBounds,
  onChange,
  onReset,
  resultCount,
}) => (
  <aside className="hidden md:flex md:flex-col md:w-[260px] lg:w-[280px] shrink-0 h-full border-r border-border bg-background overflow-hidden">
    <div className="p-4 border-b border-border shrink-0">
      <h2 className="font-bold text-base flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        Filtros
      </h2>
      <p className="text-xs text-muted-foreground mt-1">
        {resultCount} resultado{resultCount === 1 ? '' : 's'}
      </p>
    </div>
    <MarketplaceFilterPanel
      variant="sidebar"
      filters={filters}
      priceBounds={priceBounds}
      onChange={onChange}
      onReset={onReset}
    />
  </aside>
);
