/** Shape produced by PersonalProfileSetupScreen → maps to `profiles` table */
export interface UserProfile {
  avatar: string;
  avatarUrl?: string | null;
  fullName: string;
  phone: string;
  email: string;
  neighborhood: string;
  emergencyContact: string;
  emergencyPhone: string;
  language: 'es' | 'en';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

/** Row shape for Supabase `profiles` (extend when migrations exist) */
export interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  neighborhood: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  avatar_emoji: string | null;
  avatar_url: string | null;
  language: string | null;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}
