/**
 * @deprecated Prefer `import { getSupabaseClient } from '@/lib/supabase/client'`.
 * This file exists so `@/lib/supabase` resolves without conflicting with the `supabase/` folder.
 */
export { getSupabaseClient } from './supabase/client';

/** @deprecated Use getSupabaseClient() */
export { getSupabaseClient as supabase } from './supabase/client';
