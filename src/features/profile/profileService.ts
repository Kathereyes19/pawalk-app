import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import { loadStoredUserBundle, saveStoredUserBundle } from '@/lib/userStorage';
import type { ProfileRow, UserProfile } from '@/types';

export function mapProfileToRow(
  userId: string,
  profile: UserProfile
): Omit<ProfileRow, 'id' | 'created_at' | 'updated_at' | 'onboarding_completed'> {
  const avatar = profile.avatar;
  const avatarUrl =
    profile.avatarUrl ??
    (avatar.startsWith('http') || avatar.startsWith('data:') ? avatar : null);

  return {
    user_id: userId,
    full_name: profile.fullName,
    phone: profile.phone,
    email: profile.email,
    neighborhood: profile.neighborhood,
    emergency_contact: profile.emergencyContact,
    emergency_phone: profile.emergencyPhone,
    avatar_emoji: avatar.length <= 4 ? avatar : '👤',
    avatar_url: avatarUrl,
    language: profile.language,
  };
}

export function mapRowToUserProfile(row: ProfileRow): UserProfile {
  const avatarUrl = row.avatar_url ?? null;
  return {
    avatar: avatarUrl ?? row.avatar_emoji ?? '👤',
    avatarUrl,
    fullName: row.full_name ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    neighborhood: row.neighborhood ?? '',
    emergencyContact: row.emergency_contact ?? '',
    emergencyPhone: row.emergency_phone ?? '',
    language: (row.language === 'en' ? 'en' : 'es') as 'es' | 'en',
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
  };
}

export async function fetchProfile(
  userId: string
): Promise<{ profile: UserProfile | null; onboardingCompleted: boolean; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    const stored = loadStoredUserBundle(userId);
    return {
      profile: stored?.profile ?? null,
      onboardingCompleted: stored?.onboardingCompleted ?? false,
      error: null,
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { profile: null, onboardingCompleted: false, error: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { profile: null, onboardingCompleted: false, error: new Error(error.message) };
  }

  if (!data) {
    return { profile: null, onboardingCompleted: false, error: null };
  }

  return {
    profile: mapRowToUserProfile(data as ProfileRow),
    onboardingCompleted: Boolean((data as ProfileRow).onboarding_completed),
    error: null,
  };
}

export async function upsertProfile(
  userId: string,
  profile: UserProfile
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    const stored = loadStoredUserBundle(userId) ?? {
      onboardingCompleted: false,
      profile: null,
      pets: [],
    };
    saveStoredUserBundle(userId, {
      ...stored,
      profile,
    });
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

export async function markOnboardingComplete(
  userId: string,
  profile?: UserProfile
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    const stored = loadStoredUserBundle(userId) ?? {
      onboardingCompleted: false,
      profile: null,
      pets: [],
    };
    saveStoredUserBundle(userId, {
      ...stored,
      onboardingCompleted: true,
      profile: profile ?? stored.profile,
      pets: stored.pets,
    });
    return { error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: null };
  }

  const baseRow = profile
    ? { ...mapProfileToRow(userId, profile), onboarding_completed: true }
    : { user_id: userId, onboarding_completed: true };

  const { error } = await supabase
    .from('profiles')
    .upsert(
      { ...baseRow, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  return { error: error ? new Error(error.message) : null };
}
