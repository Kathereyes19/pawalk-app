export type WalkerServiceType = 'dog-walking' | 'pet-sitting' | 'grooming' | 'veterinary';
export type PetSpeciesAccept = 'dog' | 'cat';
export type DogSizeAccept = 'small' | 'medium' | 'large';

export interface Walker {
  id: string;
  name: string;
  avatar: string;
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
  acceptedSpecies?: PetSpeciesAccept[];
  acceptedSizes?: DogSizeAccept[];
  /** ISO date (YYYY-MM-DD) when walker becomes available again */
  nextAvailableDate?: string | null;
  /** HH:mm — next bookable window start */
  nextAvailableTime?: string | null;
}
