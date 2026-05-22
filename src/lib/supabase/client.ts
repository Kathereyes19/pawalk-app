import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/config/env';

let client: SupabaseClient | null = null;

/**
 * Lazy singleton Supabase client.
 * Returns null when env vars are missing so the app keeps working in mock mode.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!client) {
    client = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return client;
}
