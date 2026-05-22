export type WalkerServiceType = 'dog-walking' | 'pet-sitting' | 'grooming' | 'veterinary';
export type PetSpeciesAccept = 'dog' | 'cat';
export type DogSizeAccept = 'small' | 'medium' | 'large';
export type WalkDurationOffer = 30 | 60 | 90;
export type CaregiverServiceOffer = 'overnight' | 'in-home' | 'multi-pet';
export type VetServiceOffer = 'emergency' | 'vaccination' | 'grooming';
export type HomeCategory = 'walkers' | 'caregivers' | 'veterinary';

export interface Walker {
  id: string;
  name: string;
  avatar: string;
  /** Supabase or uploaded profile photo URL */
  avatarUrl?: string | null;
  rating: number;
  reviews: number;
  distance: number;
  price: number;
  verified: boolean;
  experience: number;
  available: boolean;
  responseTime: number;
  position: { lat: number; lng: number };
  serviceType?: WalkerServiceType;
  homeCategory?: HomeCategory;
  acceptedSpecies?: PetSpeciesAccept[];
  acceptedSizes?: DogSizeAccept[];
  walkDurations?: WalkDurationOffer[];
  caregiverServices?: CaregiverServiceOffer[];
  vetServices?: VetServiceOffer[];
  /** ISO date (YYYY-MM-DD) when walker becomes available again */
  nextAvailableDate?: string | null;
  /** HH:mm — next bookable window start */
  nextAvailableTime?: string | null;
  /** Institutional / vet profile fields */
  businessAddress?: string;
  businessHours?: string;
  businessPhone?: string;
  galleryEmojis?: string[];
}
