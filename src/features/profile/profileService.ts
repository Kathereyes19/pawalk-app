import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import type { ProfileRow, UserProfile } from '@/types';

/**
 * Maps onboarding form data to a profiles row insert/update payload.
 * Call after sign-up once `profiles` table exists in Supabase.
 */
export function mapProfileToRow(userId: string, profile: UserProfile): Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    full_name: profile.fullName,
    phone: profile.phone,
    email: profile.email,
    neighborhood: profile.neighborhood,
    emergency_contact: profile.emergencyContact,
    emergency_phone: profile.emergencyPhone,
    avatar_emoji: profile.avatar,
    language: profile.language,
    onboarding_completed: false,
  };
}

export async function upsertProfile(
  userId: string,
  profile: UserProfile
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: null };
  }

  const row = mapProfileToRow(userId, profile);
  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'user_id' });

  return { error: error ? new Error(error.message) : null };
}

export async function markOnboardingComplete(userId: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: null };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('user_id', userId);

  return { error: error ? new Error(error.message) : null };
}
