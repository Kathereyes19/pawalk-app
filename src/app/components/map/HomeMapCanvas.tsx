import React, { memo, useMemo } from 'react';
import { Navigation } from 'lucide-react';
import type { Walker } from '@/types';
import { latLngToMapPercent } from '@/lib/walkers/mockWalkers';

interface HomeMapCanvasProps {
  walkers: Walker[];
  selectedWalkerId?: string | null;
  onSelectWalker: (walker: Walker) => void;
  availableCount: number;
}

const CALI_AREAS = [
  { label: 'Granada', left: '62%', top: '28%' },
  { label: 'San Fernando', left: '38%', top: '52%' },
  { label: 'El Peñón', left: '72%', top: '58%' },
  { label: 'Ciudad Jardín', left: '24%', top: '68%' },
];

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
    <div className="absolute inset-0 bg-[#e8edf2]" />
    <div
      className="absolute inset-0 opacity-90"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.12) 0%, transparent 42%),
          radial-gradient(circle at 78% 65%, rgba(255, 107, 53, 0.1) 0%, transparent 40%),
          linear-gradient(180deg, #dfe8ef 0%, #eef2f5 45%, #e3ebe3 100%)
        `,
      }}
    />

    <svg className="absolute inset-0 w-full h-full opacity-35" aria-hidden>
      <defs>
        <pattern id="home-map-grid" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#94a3b8" strokeWidth="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#home-map-grid)" />
      <path
        d="M -5 95 Q 80 70 190 88 T 400 78"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 30 20 Q 120 45 220 35 T 390 55"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 100 0 L 95 220"
        fill="none"
        stroke="#d1d5db"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>

    {CALI_AREAS.map((area) => (
      <span
        key={area.label}
        className="absolute text-[10px] font-medium text-slate-500/80 pointer-events-none"
        style={{ left: area.left, top: area.top }}
      >
        {area.label}
      </span>
    ))}

    <div className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 z-20">
      <div className="relative">
        <div className="w-14 h-14 bg-info rounded-full flex items-center justify-center shadow-xl border-[3px] border-white home-map-user-pulse">
          <Navigation className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>

    {walkers.map((walker) => (
      <MemoWalkerPin
        key={walker.id}
        walker={walker}
        isSelected={selectedWalkerId === walker.id}
        onSelect={() => onSelectWalker(walker)}
      />
    ))}

    <div className="absolute bottom-3 left-3 z-30 bg-card/95 backdrop-blur-md rounded-full px-3 py-1.5 shadow-md border border-border">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success home-map-live-dot" />
        <span className="text-xs font-semibold">{availableCount} disponibles · Cali</span>
      </div>
    </div>
  </div>
);
