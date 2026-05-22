import { dayAfterTomorrowDateKey, tomorrowDateKey } from './availability';
import type { Walker } from '@/types';

/** Cali, Colombia — approximate service area (privacy-safe, not exact addresses) */
export const CALI_MAP_BOUNDS = {
  north: 3.468,
  south: 3.408,
  west: -76.548,
  east: -76.508,
};

export const CALI_MAP_CENTER = { lat: 3.4516, lng: -76.532 };

export const MOCK_WALKERS: Walker[] = [
  {
    id: '1',
    name: 'María González',
    avatar: '👩🏻',
    rating: 4.9,
    reviews: 127,
    distance: 0.8,
    price: 15000,
    verified: true,
    experience: 5,
    available: true,
    responseTime: 2,
    position: { lat: 3.4562, lng: -76.5284 },
    serviceType: 'dog-walking',
    acceptedSpecies: ['dog', 'cat'],
    acceptedSizes: ['small', 'medium', 'large'],
  },
  {
    id: '2',
    name: 'Carlos Ramírez',
    avatar: '👨🏽',
    rating: 4.8,
    reviews: 89,
    distance: 1.2,
    price: 12000,
    verified: true,
    experience: 3,
    available: true,
    responseTime: 5,
    position: { lat: 3.4488, lng: -76.5196 },
    serviceType: 'dog-walking',
    acceptedSpecies: ['dog'],
    acceptedSizes: ['medium', 'large'],
  },
  {
    id: '3',
    name: 'Laura Martínez',
    avatar: '👩🏼',
    rating: 5.0,
    reviews: 203,
    distance: 1.5,
    price: 18000,
    verified: true,
    experience: 7,
    available: false,
    responseTime: 10,
    position: { lat: 3.4425, lng: -76.5248 },
    serviceType: 'pet-sitting',
    acceptedSpecies: ['cat'],
    acceptedSizes: [],
    nextAvailableDate: tomorrowDateKey(),
    nextAvailableTime: '14:00',
  },
  {
    id: '4',
    name: 'Juan Pérez',
    avatar: '👨🏻',
    rating: 4.7,
    reviews: 56,
    distance: 2.1,
    price: 10000,
    verified: true,
    experience: 2,
    available: true,
    responseTime: 3,
    position: { lat: 3.4342, lng: -76.5388 },
    serviceType: 'dog-walking',
    acceptedSpecies: ['dog'],
    acceptedSizes: ['small', 'medium'],
  },
  {
    id: '5',
    name: 'Ana Silva',
    avatar: '👩🏽',
    rating: 4.95,
    reviews: 178,
    distance: 2.8,
    price: 16000,
    verified: false,
    experience: 4,
    available: false,
    responseTime: 7,
    position: { lat: 3.4288, lng: -76.5312 },
    serviceType: 'grooming',
    acceptedSpecies: ['dog', 'cat'],
    acceptedSizes: ['small', 'medium', 'large'],
    nextAvailableDate: dayAfterTomorrowDateKey(),
    nextAvailableTime: '10:00',
  },
  {
    id: '6',
    name: 'Diego Morales',
    avatar: '👨🏼',
    rating: 4.6,
    reviews: 42,
    distance: 3.5,
    price: 9000,
    verified: true,
    experience: 1,
    available: true,
    responseTime: 12,
    position: { lat: 3.4186, lng: -76.5426 },
    serviceType: 'dog-walking',
    acceptedSpecies: ['dog'],
    acceptedSizes: ['small'],
  },
  {
    id: '7',
    name: 'Sofía Torres',
    avatar: '👩🏻',
    rating: 5.0,
    reviews: 312,
    distance: 4.2,
    price: 22000,
    verified: true,
    experience: 8,
    available: false,
    responseTime: 15,
    position: { lat: 3.4124, lng: -76.5188 },
    serviceType: 'pet-sitting',
    acceptedSpecies: ['dog', 'cat'],
    acceptedSizes: ['small', 'medium', 'large'],
    nextAvailableDate: tomorrowDateKey(),
    nextAvailableTime: '09:00',
  },
  {
    id: '8',
    name: 'Dr. Valeria Ruiz',
    avatar: '👩‍⚕️',
    rating: 4.9,
    reviews: 94,
    distance: 1.8,
    price: 25000,
    verified: true,
    experience: 6,
    available: true,
    responseTime: 4,
    position: { lat: 3.445, lng: -76.526 },
    serviceType: 'veterinary',
    acceptedSpecies: ['dog', 'cat'],
    acceptedSizes: ['small', 'medium', 'large'],
  },
];

export function latLngToMapPercent(lat: number, lng: number): { left: string; top: string } {
  const { north, south, west, east } = CALI_MAP_BOUNDS;
  const x = ((lng - west) / (east - west)) * 100;
  const y = ((north - lat) / (north - south)) * 100;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  return {
    left: `${clamp(x, 10, 90)}%`,
    top: `${clamp(y, 14, 86)}%`,
  };
}

export function nudgeWalkerPosition(
  position: Walker['position'],
  seed: number
): Walker['position'] {
  const angle = seed * 0.7;
  const delta = 0.00004;
  return {
    lat: position.lat + Math.cos(angle) * delta,
    lng: position.lng + Math.sin(angle) * delta,
  };
}
