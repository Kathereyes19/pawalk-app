import React, { useMemo } from 'react';
import { Star, TrendingUp, Users, Sparkles } from 'lucide-react';
import { Card } from '../Card';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { HomeFilterPanel } from './HomeFilterPanel';
import { getWalkerAvatarProps } from '@/lib/avatars';
import type { Walker } from '@/types';
import type { CategoryQuickFilterId, HomeServiceCategory } from '@/types/homeDiscovery';

interface HomeDesktopRightPanelProps {
  category: HomeServiceCategory;
  activeFilterCount: number;
  resultCount: number;
  availableCount: number;
  providers: Walker[];
  isQuickFilterActive: (id: CategoryQuickFilterId) => boolean;
  onQuickFilterToggle: (id: CategoryQuickFilterId) => void;
  onOpenAdvanced: () => void;
  onClear: () => void;
  onProviderClick: (provider: Walker) => void;
}

export const HomeDesktopRightPanel: React.FC<HomeDesktopRightPanelProps> = ({
  category,
  activeFilterCount,
  resultCount,
  availableCount,
  providers,
  isQuickFilterActive,
  onQuickFilterToggle,
  onOpenAdvanced,
  onClear,
  onProviderClick,
}) => {
  const featuredProviders = useMemo(
    () =>
      [...providers]
        .filter((provider) => provider.available)
        .sort((a, b) => b.rating - a.rating || a.distance - b.distance)
        .slice(0, 3),
    [providers]
  );

  const averageRating = useMemo(() => {
    if (providers.length === 0) return '—';
    const sum = providers.reduce((acc, provider) => acc + provider.rating, 0);
    return (sum / providers.length).toFixed(1);
  }, [providers]);

  return (
    <aside className="hidden md:flex md:flex-col md:w-[300px] lg:w-[340px] xl:w-[380px] shrink-0 h-full border-l border-border bg-background overflow-hidden md:col-start-2">
      <div className="p-5 border-b border-border shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Panel</p>
        <h2 className="font-bold text-lg mt-1">Filtros y destacados</h2>
      </div>

      <div className="p-5 space-y-3 border-b border-border shrink-0">
        <div className="grid grid-cols-3 gap-2">
          <Card padding="sm" className="text-center bg-primary/5 border-primary/10">
            <Users className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{resultCount}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </Card>
          <Card padding="sm" className="text-center bg-success/5 border-success/20">
            <TrendingUp className="w-4 h-4 text-success mx-auto mb-1" />
            <p className="text-lg font-bold">{availableCount}</p>
            <p className="text-[10px] text-muted-foreground">Disponibles</p>
          </Card>
          <Card padding="sm" className="text-center">
            <Star className="w-4 h-4 text-secondary mx-auto mb-1 fill-secondary" />
            <p className="text-lg font-bold">{averageRating}</p>
            <p className="text-[10px] text-muted-foreground">Rating</p>
          </Card>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <HomeFilterPanel
          category={category}
          activeFilterCount={activeFilterCount}
          resultCount={resultCount}
          isQuickFilterActive={isQuickFilterActive}
          onQuickFilterToggle={onQuickFilterToggle}
          onOpenAdvanced={onOpenAdvanced}
          onClear={onClear}
          showHeader={false}
        />
      </div>

      <div className="p-5 space-y-3 border-t border-border shrink-0 max-h-[40%] overflow-y-auto">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Recomendados
        </h3>
        {featuredProviders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay proveedores destacados con los filtros actuales.
          </p>
        ) : (
          featuredProviders.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => onProviderClick(provider)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all text-left"
            >
              <Avatar {...getWalkerAvatarProps(provider)} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{provider.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge size="sm" variant="success">
                    ★ {provider.rating}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{provider.distance} km</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
};
