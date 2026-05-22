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
}
