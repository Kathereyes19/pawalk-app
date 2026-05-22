import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import { clearMockUserId } from '@/lib/mockUser';
import type { AuthResult, SignInCredentials, SignUpCredentials } from '@/types';

function mapAuthError(message: string): AuthResult['error'] {
  const lower = message.toLowerCase();
  if (lower.includes('password') || lower.includes('credentials')) {
    return { message, field: 'password' };
  }
  if (lower.includes('email') || lower.includes('user')) {
    return { message, field: 'email' };
  }
  return { message };
}

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
    return { data: null, error: mapAuthError(error.message), mode: 'supabase' };
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
  if (!isSupabaseConfigured()) {
    return { data: { userId: null }, error: null, mode: 'mock' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: { userId: null }, error: null, mode: 'mock' };
  }

  const { data, error } = await supabase.auth.signUp({
    email: credentials.email.trim(),
    password: credentials.password,
    options: {
      data: {
        full_name: credentials.fullName.trim(),
      },
    },
  });

  if (error) {
    return { data: null, error: mapAuthError(error.message), mode: 'supabase' };
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
