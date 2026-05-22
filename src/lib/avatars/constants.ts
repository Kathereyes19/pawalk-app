import type { HomeServiceCategory } from '@/types/homeDiscovery';
import type { MarketplaceCategory } from '@/types';

export const PET_SPECIES_EMOJI: Record<string, string> = {
  dog: '🐶',
  perro: '🐶',
  cat: '🐱',
  gato: '🐱',
};

export const DEFAULT_PET_EMOJI = '🐾';

export const PROVIDER_CATEGORY_EMOJI: Record<HomeServiceCategory, string> = {
  walkers: '🚶',
  caregivers: '🐕',
  veterinary: '🏥',
};

export const MARKETPLACE_CATEGORY_EMOJI: Record<MarketplaceCategory, string> = {
  food: '🍖',
  grooming: '🧼',
  toys: '🎾',
  veterinary: '🏥',
  services: '🐾',
};

export const DEFAULT_USER_EMOJI = '👤';
