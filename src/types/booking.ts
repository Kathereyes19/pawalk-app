import type { HomeServiceCategory } from './homeDiscovery';
import type { Walker, CaregiverServiceOffer } from './walker';
import type { ReservationPet } from './reservation';

/** Booking payload passed through checkout → confirmed → tracking */
export interface BookingData {
  date?: string;
  time?: string;
  duration?: number;
  durationLabel?: string;
  serviceCategory?: HomeServiceCategory;
  selectedServiceId?: string;
  selectedServiceName?: string;
  careType?: CaregiverServiceOffer;
  careInstructions?: string;
  isOvernight?: boolean;
  institutionAddress?: string;
  pets?: ReservationPet[];
  petIds?: string[];
  petId?: string;
  petName?: string;
  termsAccepted?: boolean;
  serviceFee?: number;
  platformFee?: number;
  total?: number;
  [key: string]: unknown;
}

export interface BookingFlowState {
  selectedWalker: Walker | null;
  bookingData: BookingData | null;
}
