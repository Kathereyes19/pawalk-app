import React, { memo, useMemo, useState } from 'react';
import type { Walker } from '@/types';
import type { HomeServiceCategory } from '@/types/homeDiscovery';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import { getWalkerAvatarProps } from '@/lib/images';
import { latLngToMapPercent } from '@/lib/walkers/mockWalkers';
import { MapBaseLayer } from './MapBaseLayer';

interface HomeMapCanvasProps {
  walkers: Walker[];
  category: HomeServiceCategory;
  selectedWalkerId?: string | null;
  onSelectWalker: (walker: Walker) => void;
  availableCount: number;
  totalCount?: number;
}

const PIN_STYLES: Record<
  HomeServiceCategory,
  { available: string; unavailable: string; badge: string }
> = {
  walkers: {
    available: 'bg-primary',
    unavailable: 'bg-muted-foreground/35',
    badge: '🐾',
  },
  caregivers: {
    available: 'bg-secondary',
    unavailable: 'bg-muted-foreground/35',
    badge: '🏠',
  },
  veterinary: {
    available: 'bg-accent',
    unavailable: 'bg-muted-foreground/35',
    badge: '🩺',
  },
};

function WalkerPin({
  walker,
  category,
  isSelected,
  onSelect,
}: {
  walker: Walker;
  category: HomeServiceCategory;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const position = useMemo(
    () => latLngToMapPercent(walker.position.lat, walker.position.lng),
    [walker.position.lat, walker.position.lng]
  );

  const resolvedCategory = getWalkerHomeCategory(walker);
  const styles = PIN_STYLES[resolvedCategory] ?? PIN_STYLES[category];
  const isClinic = resolvedCategory === 'veterinary' && walker.name.toLowerCase().includes('clínica');
  const avatar = useMemo(() => getWalkerAvatarProps(walker), [walker]);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      type="button"
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-out"
      style={position}
      onClick={onSelect}
      aria-label={walker.name}
    >
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-[3px] border-white transition-all overflow-hidden ${
            walker.available ? styles.available : styles.unavailable
          } ${isSelected ? 'ring-4 ring-primary/35 scale-110' : ''} ${
            isClinic ? 'rounded-2xl' : 'rounded-full'
          }`}
        >
          {!imageFailed ? (
            <img
              src={avatar.src}
              alt={avatar.alt}
              className="w-full h-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="text-xl leading-none">{isClinic ? '🏥' : walker.avatar}</span>
          )}
        </div>

        <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-card border border-border text-[10px] flex items-center justify-center shadow-sm">
          {styles.badge}
        </span>

        {walker.available && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-white home-map-pin-live" />
        )}

        {!walker.available && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-muted-foreground/60 border-2 border-white" />
        )}

        {isSelected && (
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-card px-2.5 py-1 rounded-full shadow-md border border-border whitespace-nowrap">
            <span className="text-[10px] font-bold text-primary">
              ${walker.price.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

const MemoWalkerPin = memo(WalkerPin);

export const HomeMapCanvas: React.FC<HomeMapCanvasProps> = ({
  walkers,
  category,
  selectedWalkerId,
  onSelectWalker,
  availableCount,
  totalCount,
}) => {
  const mapLabel =
    category === 'walkers' ? 'paseadores' : category === 'caregivers' ? 'cuidadores' : 'clínicas';

  return (
    <div className="absolute inset-0 overflow-hidden">
      <MapBaseLayer gridPatternId="home-map-grid" showUserPin>
        {walkers.map((walker) => (
          <MemoWalkerPin
            key={walker.id}
            walker={walker}
            category={category}
            isSelected={selectedWalkerId === walker.id}
            onSelect={() => onSelectWalker(walker)}
          />
        ))}
      </MapBaseLayer>

      <div className="absolute bottom-3 left-3 z-30 bg-card/95 backdrop-blur-md rounded-full px-3 py-1.5 shadow-md border border-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success home-map-live-dot" />
          <span className="text-xs font-semibold">
            {availableCount} disponibles
            {typeof totalCount === 'number' ? ` · ${totalCount} ${mapLabel}` : ''} · Cali
          </span>
        </div>
      </div>
    </div>
  );
};
