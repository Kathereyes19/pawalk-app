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
  serviceType?: 'dog-walking' | 'pet-sitting' | 'grooming';
  /** ISO date (YYYY-MM-DD) when walker becomes available again */
  nextAvailableDate?: string | null;
  /** HH:mm — next bookable window start */
  nextAvailableTime?: string | null;
}
