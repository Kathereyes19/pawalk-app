import { latLngToMapPercent } from './mockWalkers';

export interface MapPercentPoint {
  x: number;
  y: number;
}

/** Privacy-safe Cali walk loop: home → San Fernando → El Peñón → Granada → home */
const CALI_WALK_ROUTE_LATLNG = [
  { lat: 3.4288, lng: -76.5352 },
  { lat: 3.4342, lng: -76.5338 },
  { lat: 3.4396, lng: -76.5310 },
  { lat: 3.4450, lng: -76.5284 },
  { lat: 3.4504, lng: -76.5260 },
  { lat: 3.4548, lng: -76.5236 },
  { lat: 3.4520, lng: -76.5198 },
  { lat: 3.4480, lng: -76.5224 },
  { lat: 3.4436, lng: -76.5268 },
  { lat: 3.4388, lng: -76.5316 },
  { lat: 3.4288, lng: -76.5352 },
];

function parsePercent(value: string): number {
  return Number.parseFloat(value.replace('%', ''));
}

export function buildWalkRouteFromLatLng(
  coords: { lat: number; lng: number }[] = CALI_WALK_ROUTE_LATLNG
): MapPercentPoint[] {
  return coords.map((coord) => {
    const point = latLngToMapPercent(coord.lat, coord.lng);
    return {
      x: parsePercent(point.left),
      y: parsePercent(point.top),
    };
  });
}

export const DEFAULT_WALK_ROUTE = buildWalkRouteFromLatLng();

export function buildRoutePathD(points: MapPercentPoint[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(' ')}`;
}

/** Path from start through current progress (for live traced route) */
export function buildPartialRoutePathD(
  points: MapPercentPoint[],
  progressPercent: number
): string {
  if (points.length === 0) return '';
  if (progressPercent <= 0) {
    const start = points[0];
    return `M ${start.x} ${start.y}`;
  }
  if (progressPercent >= 100) return buildRoutePathD(points);

  const progress = progressPercent / 100;
  const scaled = progress * (points.length - 1);
  const index = Math.floor(scaled);
  const segmentProgress = scaled - index;
  const current = points[index];
  const next = points[Math.min(index + 1, points.length - 1)];
  const tip = {
    x: current.x + (next.x - current.x) * segmentProgress,
    y: current.y + (next.y - current.y) * segmentProgress,
  };

  const pathPoints = points.slice(0, index + 1);
  pathPoints.push(tip);
  return buildRoutePathD(pathPoints);
}

export function interpolateRoutePosition(
  points: MapPercentPoint[],
  progressPercent: number
): MapPercentPoint {
  if (points.length === 0) return { x: 50, y: 50 };
  if (points.length === 1) return points[0];

  const progress = Math.min(100, Math.max(0, progressPercent)) / 100;
  const scaled = progress * (points.length - 1);
  const index = Math.floor(scaled);
  const nextIndex = Math.min(index + 1, points.length - 1);
  const segmentProgress = scaled - index;

  const current = points[index];
  const next = points[nextIndex];

  return {
    x: current.x + (next.x - current.x) * segmentProgress,
    y: current.y + (next.y - current.y) * segmentProgress,
  };
}

export function getRouteHeading(points: MapPercentPoint[], progressPercent: number): number {
  const current = interpolateRoutePosition(points, progressPercent);
  const ahead = interpolateRoutePosition(points, Math.min(100, progressPercent + 2));
  const dx = ahead.x - current.x;
  const dy = ahead.y - current.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
}
