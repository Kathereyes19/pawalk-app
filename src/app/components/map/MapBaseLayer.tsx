import React from 'react';
import { Navigation } from 'lucide-react';

export const CALI_AREAS = [
  { label: 'Granada', left: '62%', top: '28%' },
  { label: 'San Fernando', left: '38%', top: '52%' },
  { label: 'El Peñón', left: '72%', top: '58%' },
  { label: 'Ciudad Jardín', left: '24%', top: '68%' },
];

interface MapBaseLayerProps {
  gridPatternId?: string;
  showUserPin?: boolean;
  userPinClassName?: string;
  children?: React.ReactNode;
}

export const MapBaseLayer: React.FC<MapBaseLayerProps> = ({
  gridPatternId = 'pawalk-map-grid',
  showUserPin = false,
  userPinClassName = 'home-map-user-pulse',
  children,
}) => (
  <>
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
        <pattern id={gridPatternId} width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#94a3b8" strokeWidth="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
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
        className="absolute text-[10px] font-medium text-slate-500/80 pointer-events-none z-[1]"
        style={{ left: area.left, top: area.top }}
      >
        {area.label}
      </span>
    ))}

    {showUserPin && (
      <div className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div
          className={`w-14 h-14 bg-info rounded-full flex items-center justify-center shadow-xl border-[3px] border-white ${userPinClassName}`}
        >
          <Navigation className="w-7 h-7 text-white" />
        </div>
      </div>
    )}

    {children}
  </>
);
