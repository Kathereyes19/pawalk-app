import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import {
  clearMockUserId,
  isMockEmailRegistered,
  registerMockEmail,
} from '@/lib/mockUser';
import {
  DUPLICATE_EMAIL_ERROR,
  isDuplicateSignUpUser,
  mapSignInError,
  mapSignUpError,
} from './authErrors';
import type { AuthResult, SignInCredentials, SignUpCredentials } from '@/types';

export async function signInWithEmail(
  credentials: SignInCredentials
): Promise<AuthResult<{ userId: string | null }>> {
  if (!isSupabaseConfigured()) {
    return { data: { userId: null }, error: null, mode: 'mock' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: { userId: null }, error: null, mode: 'mock' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim(),
    password: credentials.password,
  });

  if (error) {
    return { data: null, error: mapSignInError(error), mode: 'supabase' };
  }

  return {
    data: { userId: data.user?.id ?? null },
    error: null,
    mode: 'supabase',
  };
}

export async function signUpWithEmail(
  credentials: SignUpCredentials
): Promise<AuthResult<{ userId: string | null }>> {
  const normalizedEmail = credentials.email.trim().toLowerCase();

  if (!isSupabaseConfigured()) {
    if (isMockEmailRegistered(normalizedEmail)) {
      return { data: null, error: DUPLICATE_EMAIL_ERROR, mode: 'mock' };
    }
    registerMockEmail(normalizedEmail);
    return { data: { userId: null }, error: null, mode: 'mock' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: { userId: null }, error: null, mode: 'mock' };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: credentials.password,
    options: {
      data: {
        full_name: credentials.fullName.trim(),
      },
    },
  });

  if (error) {
    return { data: null, error: mapSignUpError(error), mode: 'supabase' };
  }

  if (isDuplicateSignUpUser(data.user)) {
    return { data: null, error: DUPLICATE_EMAIL_ERROR, mode: 'supabase' };
  }

  return {
    data: { userId: data.user?.id ?? null },
    error: null,
    mode: 'supabase',
  };
}

export async function signOut(): Promise<void> {
  clearMockUserId();
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
}
