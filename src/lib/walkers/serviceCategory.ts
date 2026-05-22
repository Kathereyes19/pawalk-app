import type { Walker } from '@/types';
import type { HomeServiceCategory } from '@/types/homeDiscovery';

export function getWalkerHomeCategory(walker: Walker): HomeServiceCategory {
  if (walker.homeCategory) return walker.homeCategory;

  switch (walker.serviceType) {
    case 'pet-sitting':
      return 'caregivers';
    case 'veterinary':
    case 'grooming':
      return 'veterinary';
    case 'dog-walking':
    default:
      return 'walkers';
  }
}

export function filterProvidersByCategory(
  providers: Walker[],
  category: HomeServiceCategory
): Walker[] {
  return providers.filter((provider) => getWalkerHomeCategory(provider) === category);
}

export function getCategoryMapLabel(category: HomeServiceCategory): string {
  switch (category) {
    case 'walkers':
      return 'paseadores';
    case 'caregivers':
      return 'cuidadores';
    case 'veterinary':
      return 'clínicas';
    default:
      return 'servicios';
  }
}
