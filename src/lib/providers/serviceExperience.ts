import type { HomeServiceCategory } from '@/types/homeDiscovery';
import type {
  CaregiverServiceOffer,
  DogSizeAccept,
  VetServiceOffer,
  Walker,
} from '@/types/walker';

export type VetBookableServiceId =
  | 'grooming'
  | 'vaccination'
  | 'consultation'
  | 'spa'
  | 'emergency';

export interface VetServiceOption {
  id: VetBookableServiceId;
  name: string;
  description: string;
  durationMinutes: number;
  priceFactor: number;
  ctaLabel: string;
  icon: string;
}

export interface CareDurationOption {
  value: number;
  label: string;
  description: string;
  isOvernight?: boolean;
  nights?: number;
}

export interface ProfileIncludedService {
  icon: string;
  label: string;
}

export interface WalkerWalkStats {
  totalWalks: number;
  totalKm: number;
  avgDurationMin: number;
}

const SIZE_LABELS: Record<DogSizeAccept, string> = {
  small: 'Pequeño',
  medium: 'Mediano',
  large: 'Grande',
};

const CARE_SERVICE_LABELS: Record<CaregiverServiceOffer, string> = {
  overnight: 'Cuidado nocturno',
  'in-home': 'Cuidado en casa',
  'multi-pet': 'Varias mascotas',
};

export const VET_SERVICE_CATALOG: Record<VetBookableServiceId, VetServiceOption> = {
  grooming: {
    id: 'grooming',
    name: 'Grooming',
    description: 'Baño, corte y arreglo completo',
    durationMinutes: 90,
    priceFactor: 1.15,
    ctaLabel: 'Reservar grooming',
    icon: '✂️',
  },
  spa: {
    id: 'spa',
    name: 'Spa & bienestar',
    description: 'Spa relajante con aromaterapia',
    durationMinutes: 120,
    priceFactor: 1.4,
    ctaLabel: 'Reservar spa',
    icon: '🛁',
  },
  vaccination: {
    id: 'vaccination',
    name: 'Vacunación',
    description: 'Esquema de vacunas y refuerzos',
    durationMinutes: 30,
    priceFactor: 0.85,
    ctaLabel: 'Agendar vacunación',
    icon: '💉',
  },
  consultation: {
    id: 'consultation',
    name: 'Consulta veterinaria',
    description: 'Evaluación clínica general',
    durationMinutes: 45,
    priceFactor: 1,
    ctaLabel: 'Agendar consulta',
    icon: '🩺',
  },
  emergency: {
    id: 'emergency',
    name: 'Consulta veterinaria',
    description: 'Atención clínica y urgencias leves',
    durationMinutes: 45,
    priceFactor: 1.1,
    ctaLabel: 'Agendar cita',
    icon: '🏥',
  },
};

export function getProfileBookCta(category: HomeServiceCategory, vetServiceId?: string): string {
  if (category === 'walkers') return 'Reservar paseo';
  if (category === 'caregivers') return 'Reservar cuidado';
  if (vetServiceId && VET_SERVICE_CATALOG[vetServiceId as VetBookableServiceId]) {
    return VET_SERVICE_CATALOG[vetServiceId as VetBookableServiceId].ctaLabel;
  }
  return 'Agendar cita';
}

export function getPriceUnitLabel(category: HomeServiceCategory, isOvernight?: boolean): string {
  if (category === 'walkers') return '/hr';
  if (category === 'caregivers') return isOvernight ? '/noche' : '/hr';
  return '/servicio';
}

export function getCategoryBadgeLabel(category: HomeServiceCategory): string {
  switch (category) {
    case 'walkers':
      return 'Paseo';
    case 'caregivers':
      return 'Cuidado';
    case 'veterinary':
      return 'Servicio';
    default:
      return 'Reserva';
  }
}

export function getReservationSummaryTitle(category: HomeServiceCategory): string {
  switch (category) {
    case 'walkers':
      return 'Resumen del paseo';
    case 'caregivers':
      return 'Resumen del cuidado';
    case 'veterinary':
      return 'Detalle de la cita';
    default:
      return 'Resumen';
  }
}

export function supportsLiveTracking(category: HomeServiceCategory): boolean {
  return category === 'walkers';
}

export function getWalkerWalkStats(walker: Walker): WalkerWalkStats {
  const totalWalks = Math.round(walker.reviews * 2.4 + walker.experience * 18);
  const totalKm = Number((totalWalks * (2.1 + walker.rating * 0.15)).toFixed(1));
  const avgDurationMin = walker.walkDurations?.includes(60)
    ? 60
    : walker.walkDurations?.[0] ?? 60;
  return { totalWalks, totalKm, avgDurationMin };
}

export function formatAcceptedSizes(sizes?: DogSizeAccept[]): string {
  if (!sizes?.length) return 'Consultar';
  return sizes.map((size) => SIZE_LABELS[size]).join(', ');
}

export function getWalkPreferences(walker: Walker): string[] {
  const prefs: string[] = [];
  if (walker.walkDurations?.includes(30)) prefs.push('Paseos cortos (30 min)');
  if (walker.walkDurations?.includes(60)) prefs.push('Paseos estándar (60 min)');
  if (walker.walkDurations?.includes(90)) prefs.push('Paseos largos (90 min)');
  if (walker.acceptedSpecies?.includes('cat')) prefs.push('Acepta gatos');
  if (walker.acceptedSpecies?.includes('dog')) prefs.push('Rutas urbanas y parques');
  return prefs.length ? prefs : ['Rutas personalizadas según mascota'];
}

export function getIncludedServices(
  category: HomeServiceCategory,
  walker: Walker
): ProfileIncludedService[] {
  if (category === 'walkers') {
    return [
      { icon: '🚶', label: 'Paseo personalizado' },
      { icon: '📸', label: 'Fotos en vivo' },
      { icon: '🗺️', label: 'Seguimiento GPS' },
      { icon: '💧', label: 'Agua incluida' },
      { icon: '🎾', label: 'Tiempo de juego' },
      { icon: '🏥', label: 'Seguro incluido' },
    ];
  }

  if (category === 'caregivers') {
    const services: ProfileIncludedService[] = [];
    if (walker.caregiverServices?.includes('in-home')) {
      services.push({ icon: '🏠', label: 'Cuidado en casa' });
    }
    if (walker.caregiverServices?.includes('overnight')) {
      services.push({ icon: '🌙', label: 'Cuidado nocturno' });
    }
    if (walker.caregiverServices?.includes('multi-pet')) {
      services.push({ icon: '🐾', label: 'Varias mascotas' });
    }
    services.push(
      { icon: '📱', label: 'Actualizaciones en vivo' },
      { icon: '🍽️', label: 'Alimentación programada' },
      { icon: '💊', label: 'Administración de medicamentos' }
    );
    return services.slice(0, 6);
  }

  return [
    { icon: '🩺', label: 'Consulta veterinaria' },
    { icon: '💉', label: 'Vacunación' },
    { icon: '✂️', label: 'Grooming & spa' },
    { icon: '🏥', label: 'Instalaciones certificadas' },
    { icon: '📋', label: 'Historial clínico' },
    { icon: '📞', label: 'Contacto directo' },
  ];
}

export function getProfileAboutText(category: HomeServiceCategory, walker: Walker): string {
  if (category === 'walkers') {
    return `Soy un amante de los animales con ${walker.experience} años de experiencia en paseos. Me especializo en rutas seguras, ejercicio adaptado y reportes en tiempo real para que tu mascota disfrute cada salida.`;
  }
  if (category === 'caregivers') {
    const services = walker.caregiverServices?.map((s) => CARE_SERVICE_LABELS[s]).join(', ') ?? 'cuidado integral';
    return `Cuidador profesional con ${walker.experience} años de experiencia. Ofrezco ${services.toLowerCase()} con atención personalizada, rutinas de alimentación y reportes durante la estadía.`;
  }
  const isClinic = walker.name.toLowerCase().includes('clínica');
  if (isClinic) {
    return `${walker.name} es un centro veterinario con ${walker.experience}+ años de trayectoria en Cali. Contamos con consultas, vacunación, grooming y atención de urgencias leves en instalaciones modernas.`;
  }
  return `Profesional veterinaria con ${walker.experience} años de experiencia clínica. Atención personalizada para perros y gatos con enfoque en prevención, vacunación y bienestar integral.`;
}

export function getVetServicesForProvider(walker: Walker): VetServiceOption[] {
  const offers = walker.vetServices ?? ['consultation'];
  const mapped = offers
    .map((offer) => {
      if (offer === 'emergency') return VET_SERVICE_CATALOG.emergency;
      if (offer === 'vaccination') return VET_SERVICE_CATALOG.vaccination;
      if (offer === 'grooming') return VET_SERVICE_CATALOG.grooming;
      return null;
    })
    .filter(Boolean) as VetServiceOption[];

  const unique = new Map(mapped.map((item) => [item.id, item]));
  if (walker.name.toLowerCase().includes('clínica') && !unique.has('spa')) {
    unique.set('spa', VET_SERVICE_CATALOG.spa);
  }
  return [...unique.values()];
}

export function getCareDurationOptions(careType: CaregiverServiceOffer): CareDurationOption[] {
  if (careType === 'overnight') {
    return [
      { value: 1440, label: '1 noche', description: 'Desde 6:00 PM hasta 8:00 AM', isOvernight: true, nights: 1 },
      { value: 2880, label: '2 noches', description: 'Estadía extendida en casa', isOvernight: true, nights: 2 },
      { value: 4320, label: '3 noches', description: 'Ideal para viajes largos', isOvernight: true, nights: 3 },
    ];
  }
  return [
    { value: 240, label: '4 horas', description: 'Visita corta de cuidado' },
    { value: 480, label: '8 horas', description: 'Medio día de acompañamiento' },
    { value: 720, label: '12 horas', description: 'Jornada completa en casa' },
  ];
}

export function getInstitutionMeta(walker: Walker): {
  address: string;
  hours: string;
  phone: string;
  gallery: string[];
} {
  const isClinic = walker.name.toLowerCase().includes('clínica');
  return {
    address: walker.businessAddress ?? (isClinic ? 'Av. 5N #23-45, San Francisco, Cali' : 'Consultorio móvil — Cali'),
    hours: walker.businessHours ?? 'Lun–Sáb 8:00 AM – 6:00 PM',
    phone: walker.businessPhone ?? '+57 602 555 0142',
    gallery: walker.galleryEmojis ?? (isClinic ? ['🏥', '🩺', '✂️', '🐕', '🐈', '💉'] : ['🩺', '🐾', '💉', '📋']),
  };
}

export function calculateCategoryBookingTotals(
  walker: Walker,
  category: HomeServiceCategory,
  durationMinutes: number,
  petCount: number,
  selectedService?: VetServiceOption | null
) {
  const count = Math.max(1, petCount);

  if (category === 'veterinary' && selectedService) {
    const servicePrice = Math.round(walker.price * selectedService.priceFactor);
    const platformFee = Math.round(servicePrice * 0.12);
    const insuranceFee = Math.round(servicePrice * 0.03);
    return {
      servicePrice,
      platformFee,
      insuranceFee,
      totalPrice: servicePrice + platformFee + insuranceFee,
      petCount: count,
    };
  }

  if (category === 'caregivers') {
    const isOvernight = durationMinutes >= 1440;
    const units = isOvernight ? durationMinutes / 1440 : durationMinutes / 60;
    const servicePrice = Math.round(walker.price * units * count);
    const platformFee = Math.round(servicePrice * 0.12);
    const insuranceFee = Math.round(servicePrice * 0.05);
    return {
      servicePrice,
      platformFee,
      insuranceFee,
      totalPrice: servicePrice + platformFee + insuranceFee,
      petCount: count,
    };
  }

  const multiplier = durationMinutes === 30 ? 0.6 : durationMinutes === 90 ? 1.4 : 1;
  const servicePrice = Math.round(walker.price * multiplier * count);
  const platformFee = Math.round(servicePrice * 0.15);
  const insuranceFee = Math.round(servicePrice * 0.05);
  return {
    servicePrice,
    platformFee,
    insuranceFee,
    totalPrice: servicePrice + platformFee + insuranceFee,
    petCount: count,
  };
}

export function formatCareDurationLabel(durationMinutes: number, isOvernight?: boolean): string {
  if (isOvernight || durationMinutes >= 1440) {
    const nights = Math.round(durationMinutes / 1440);
    return nights === 1 ? '1 noche' : `${nights} noches`;
  }
  if (durationMinutes >= 60) {
    const hours = durationMinutes / 60;
    return hours === 1 ? '1 hora' : `${hours} horas`;
  }
  return `${durationMinutes} min`;
}
