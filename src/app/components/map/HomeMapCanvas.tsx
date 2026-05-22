import React, { memo, useMemo } from 'react';
import type { Walker } from '@/types';
import { latLngToMapPercent } from '@/lib/walkers/mockWalkers';
import { MapBaseLayer } from './MapBaseLayer';

interface HomeMapCanvasProps {
  walkers: Walker[];
  selectedWalkerId?: string | null;
  onSelectWalker: (walker: Walker) => void;
  availableCount: number;
}

function WalkerPin({
  walker,
  isSelected,
  onSelect,
}: {
  walker: Walker;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const position = useMemo(
    () => latLngToMapPercent(walker.position.lat, walker.position.lng),
    [walker.position.lat, walker.position.lng]
  );

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
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-[3px] border-white transition-all ${
            walker.available
              ? 'bg-primary scale-100'
              : 'bg-muted-foreground/35 scale-95'
          } ${isSelected ? 'ring-4 ring-primary/35 scale-110' : ''}`}
        >
          <span className="text-xl leading-none">{walker.avatar}</span>
        </div>

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
  selectedWalkerId,
  onSelectWalker,
  availableCount,
}) => (
  <div className="absolute inset-0 overflow-hidden">
    <MapBaseLayer gridPatternId="home-map-grid" showUserPin>
      {walkers.map((walker) => (
        <MemoWalkerPin
          key={walker.id}
          walker={walker}
          isSelected={selectedWalkerId === walker.id}
          onSelect={() => onSelectWalker(walker)}
        />
      ))}
    </MapBaseLayer>

    <div className="absolute bottom-3 left-3 z-30 bg-card/95 backdrop-blur-md rounded-full px-3 py-1.5 shadow-md border border-border">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success home-map-live-dot" />
        <span className="text-xs font-semibold">{availableCount} disponibles · Cali</span>
      </div>
    </div>
  </div>
);
