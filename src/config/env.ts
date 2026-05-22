/**
 * Centralized Vite environment access.
 * Supabase vars are optional until you connect a project (mock auth still works).
 */
export const env = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
} as const;

export function isSupabaseConfigured(): boolean {
  return Boolean(env.VITE_SUPABASE_URL?.trim() && env.VITE_SUPABASE_ANON_KEY?.trim());
}
