import React, { memo, useMemo } from 'react';
import { MapBaseLayer } from './MapBaseLayer';
import {
  buildPartialRoutePathD,
  buildRoutePathD,
  DEFAULT_WALK_ROUTE,
  interpolateRoutePosition,
  type MapPercentPoint,
} from '@/lib/walkers/walkRoute';

interface TrackingMapCanvasProps {
  progressPercent: number;
  walkerEmoji: string;
  routePoints?: MapPercentPoint[];
}

function TrackingMapCanvasComponent({
  progressPercent,
  walkerEmoji,
  routePoints = DEFAULT_WALK_ROUTE,
}: TrackingMapCanvasProps) {
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));
  const fullRoutePath = useMemo(() => buildRoutePathD(routePoints), [routePoints]);
  const traveledPath = useMemo(
    () => buildPartialRoutePathD(routePoints, clampedProgress),
    [routePoints, clampedProgress]
  );
  const walkerPosition = useMemo(
    () => interpolateRoutePosition(routePoints, clampedProgress),
    [routePoints, clampedProgress]
  );
  const start = routePoints[0];
  const end = routePoints[routePoints.length - 1];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <MapBaseLayer gridPatternId="tracking-map-grid">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 z-[2] h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="tracking-route-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B35" />
              <stop offset="55%" stopColor="#F7C548" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          <path
            d={fullRoutePath}
            stroke="#94a3b8"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1.8 2.2"
            fill="none"
            opacity="0.55"
          />

          {traveledPath.length > 0 && (
            <path
              d={traveledPath}
              stroke="url(#tracking-route-gradient)"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="tracking-route-traveled transition-all duration-700 ease-out"
            />
          )}

          {routePoints.slice(1, -1).map((point, index) => {
            const checkpointProgress = ((index + 1) / (routePoints.length - 1)) * 100;
            const reached = clampedProgress >= checkpointProgress;
            return (
              <circle
                key={`${point.x}-${point.y}-${index}`}
                cx={point.x}
                cy={point.y}
                r={reached ? 0.85 : 0.65}
                fill={reached ? '#10B981' : '#94a3b8'}
                opacity={reached ? 1 : 0.5}
              />
            );
          })}

          {start && (
            <g>
              <circle cx={start.x} cy={start.y} r="3.2" fill="#FF6B35" opacity="0.22" />
              <circle cx={start.x} cy={start.y} r="2.2" fill="#FF6B35" />
              <text x={start.x} y={start.y} textAnchor="middle" dominantBaseline="central" fontSize="2.8">
                🏠
              </text>
            </g>
          )}

          {end && (
            <g>
              <circle cx={end.x} cy={end.y} r="3.2" fill="#10B981" opacity="0.22" />
              <circle cx={end.x} cy={end.y} r="2.2" fill="#10B981" />
              <text x={end.x} y={end.y} textAnchor="middle" dominantBaseline="central" fontSize="2.8">
                🎯
              </text>
            </g>
          )}
        </svg>

        <div
          className="absolute z-[3] tracking-walker-marker transition-all duration-700 ease-out"
          style={{
            left: `${walkerPosition.x}%`,
            top: `${walkerPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-[3px] border-white bg-gradient-to-br from-primary to-accent">
              <span className="text-2xl leading-none" aria-hidden>
                {walkerEmoji}
              </span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-white home-map-pin-live" />
          </div>
        </div>
      </MapBaseLayer>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-24 bg-gradient-to-b from-[#e8edf2]/95 to-transparent"
        aria-hidden
      />
    </div>
  );
}

export const TrackingMapCanvas = memo(TrackingMapCanvasComponent);
