import type { Walker } from './walker';
import type { ReservationPet } from './reservation';

/** Booking payload passed through checkout → confirmed → tracking */
export interface BookingData {
  date?: string;
  time?: string;
  duration?: number;
  durationLabel?: string;
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
