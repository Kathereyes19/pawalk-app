import React, { memo, useMemo } from 'react';
import { MapBaseLayer } from './MapBaseLayer';
import {
  buildRoutePathD,
  DEFAULT_WALK_ROUTE,
  interpolateRoutePosition,
  type MapPercentPoint,
} from '@/lib/walkers/walkRoute';

interface TrackingMapCanvasProps {
  progressPercent: number;
  walkerAvatar: string;
  routePoints?: MapPercentPoint[];
  elapsedLabel?: string;
  distanceKm?: number;
}

function TrackingMapCanvasComponent({
  progressPercent,
  walkerAvatar,
  routePoints = DEFAULT_WALK_ROUTE,
  elapsedLabel,
  distanceKm = 0,
}: TrackingMapCanvasProps) {
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));
  const routePath = useMemo(() => buildRoutePathD(routePoints), [routePoints]);
  const walkerPosition = useMemo(
    () => interpolateRoutePosition(routePoints, clampedProgress),
    [routePoints, clampedProgress]
  );
  const start = routePoints[0];
  const end = routePoints[routePoints.length - 1];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <MapBaseLayer gridPatternId="tracking-map-grid">
        <svg className="absolute inset-0 w-full h-full z-[2]" aria-hidden>
          <defs>
            <linearGradient id="tracking-route-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B35" />
              <stop offset="55%" stopColor="#F7C548" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          <path
            d={routePath}
            stroke="#cbd5e1"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.45"
          />

          <path
            d={routePath}
            stroke="url(#tracking-route-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            pathLength={100}
            strokeDasharray={`${clampedProgress} ${100 - clampedProgress}`}
            className="tracking-route-live"
          />

          {routePoints.slice(1, -1).map((point, index) => {
            const checkpointProgress = ((index + 1) / (routePoints.length - 1)) * 100;
            const reached = clampedProgress >= checkpointProgress;
            return (
              <circle
                key={`${point.x}-${point.y}-${index}`}
                cx={`${point.x}%`}
                cy={`${point.y}%`}
                r="3"
                fill={reached ? '#10B981' : '#94a3b8'}
                opacity={reached ? 1 : 0.55}
              />
            );
          })}

          {start && (
            <g>
              <circle cx={`${start.x}%`} cy={`${start.y}%`} r="14" fill="#FF6B35" opacity="0.18" />
              <circle cx={`${start.x}%`} cy={`${start.y}%`} r="10" fill="#FF6B35" />
              <text x={`${start.x}%`} y={`${start.y}%`} textAnchor="middle" dy=".35em" fontSize="12">
                🏠
              </text>
            </g>
          )}

          {end && (
            <g>
              <circle cx={`${end.x}%`} cy={`${end.y}%`} r="14" fill="#10B981" opacity="0.18" />
              <circle cx={`${end.x}%`} cy={`${end.y}%`} r="10" fill="#10B981" />
              <text x={`${end.x}%`} y={`${end.y}%`} textAnchor="middle" dy=".35em" fontSize="12">
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
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-[3px] border-white bg-primary">
              <span className="text-2xl leading-none">{walkerAvatar}</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-white home-map-pin-live" />
          </div>
        </div>
      </MapBaseLayer>

      <div className="absolute bottom-3 left-3 right-3 z-30">
        <div className="bg-card/95 backdrop-blur-md rounded-2xl px-3 py-2.5 shadow-md border border-border">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-success home-map-live-dot shrink-0" />
              <span className="text-xs font-semibold truncate">En vivo · Cali</span>
            </div>
            <span className="text-xs font-bold text-primary shrink-0">
              {Math.round(clampedProgress)}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-success rounded-full transition-all duration-700 ease-out"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
          {(elapsedLabel || distanceKm > 0) && (
            <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
              {elapsedLabel ? <span>Tiempo: {elapsedLabel}</span> : <span />}
              {distanceKm > 0 && <span>{distanceKm.toFixed(2)} km</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const TrackingMapCanvas = memo(TrackingMapCanvasComponent);
