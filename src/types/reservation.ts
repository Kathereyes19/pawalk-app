export type ReservationStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  userId: string;
  walkerId: string;
  walkerName: string;
  walkerAvatar: string;
  petId: string | null;
  petName: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  status: ReservationStatus;
  servicePrice: number;
  platformFee: number;
  insuranceFee: number;
  totalPrice: number;
  paymentMethod?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  summaryDistanceKm?: number | null;
  summaryDurationMinutes?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReservationRow {
  id: string;
  user_id: string;
  walker_id: string;
  walker_name: string;
  walker_avatar: string | null;
  pet_id: string | null;
  pet_name: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: ReservationStatus;
  service_price: number;
  platform_fee: number;
  insurance_fee: number;
  total_price: number;
  payment_method: string | null;
  started_at: string | null;
  completed_at: string | null;
  summary_distance_km: number | null;
  summary_duration_minutes: number | null;
  created_at?: string;
  updated_at?: string;
}

export type ReservationTab = 'upcoming' | 'active' | 'history';
