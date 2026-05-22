import type { HomeServiceCategory } from '@/types';

export function getCategorySpecializationLabel(category: HomeServiceCategory): string {
  switch (category) {
    case 'walkers':
      return 'Paseador profesional';
    case 'caregivers':
      return 'Cuidador de mascotas';
    case 'veterinary':
      return 'Servicios veterinarios';
    default:
      return 'Proveedor de servicios';
  }
}
