import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import type { Pet } from '@/types';

/**
 * Persist pets for the authenticated user.
 * Requires `pets` table with RLS policies in Supabase.
 */
export async function syncPetsForUser(
  userId: string,
  pets: Pet[]
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured() || pets.length === 0) {
    return { error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: null };
  }

  const rows = pets.map((pet) => ({
    id: pet.id,
    user_id: userId,
    name: pet.name,
    breed: pet.breed,
    age: pet.age,
    weight: pet.weight,
    behaviors: pet.behaviors,
    vaccinated: pet.vaccinated,
    gender: pet.gender,
    species: pet.species,
    avatar_url: pet.avatar.startsWith('http') ? pet.avatar : null,
  }));

  const { error } = await supabase.from('pets').upsert(rows);

  return { error: error ? new Error(error.message) : null };
}
