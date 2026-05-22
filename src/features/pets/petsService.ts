import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import { ensurePetId } from '@/lib/petId';
import { loadStoredUserBundle, saveStoredUserBundle } from '@/lib/userStorage';
import type { Pet, PetRow } from '@/types';

function mapRowToPet(row: PetRow): Pet {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar_url ?? '🐾',
    breed: row.breed ?? '',
    age: row.age ?? 0,
    weight: Number(row.weight ?? 0),
    behaviors: row.behaviors ?? [],
    vaccinated: row.vaccinated,
    gender: (row.gender === 'female' ? 'female' : 'male') as 'male' | 'female',
    species: (row.species === 'cat' ? 'cat' : 'dog') as 'dog' | 'cat',
  };
}

function mapPetToRow(userId: string, pet: Pet) {
  const avatar = pet.avatar;
  return {
    id: ensurePetId(pet.id),
    user_id: userId,
    name: pet.name,
    breed: pet.breed,
    age: pet.age,
    weight: pet.weight,
    behaviors: pet.behaviors,
    vaccinated: pet.vaccinated,
    gender: pet.gender,
    species: pet.species,
    avatar_url: avatar.startsWith('http') ? avatar : avatar.length <= 4 ? avatar : null,
  };
}

export async function fetchPetsByUserId(
  userId: string
): Promise<{ pets: Pet[]; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    const stored = loadStoredUserBundle(userId);
    return { pets: stored?.pets ?? [], error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { pets: [], error: null };
  }

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    return { pets: [], error: new Error(error.message) };
  }

  return {
    pets: (data as PetRow[]).map(mapRowToPet),
    error: null,
  };
}

/**
 * Replaces the user's pets in Supabase (delete + insert) for a consistent snapshot.
 */
export async function replacePetsForUser(
  userId: string,
  pets: Pet[]
): Promise<{ pets: Pet[]; error: Error | null }> {
  const normalized = pets.map((pet) => ({
    ...pet,
    id: ensurePetId(pet.id),
  }));

  if (!isSupabaseConfigured()) {
    const stored = loadStoredUserBundle(userId) ?? {
      onboardingCompleted: false,
      profile: null,
      pets: [],
    };
    saveStoredUserBundle(userId, { ...stored, pets: normalized });
    return { pets: normalized, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { pets: normalized, error: null };
  }

  const { error: deleteError } = await supabase.from('pets').delete().eq('user_id', userId);

  if (deleteError) {
    return { pets: normalized, error: new Error(deleteError.message) };
  }

  if (normalized.length === 0) {
    return { pets: [], error: null };
  }

  const rows = normalized.map((pet) => mapPetToRow(userId, pet));
  const { error: insertError } = await supabase.from('pets').insert(rows);

  if (insertError) {
    return { pets: normalized, error: new Error(insertError.message) };
  }

  return { pets: normalized, error: null };
}

/** @deprecated Use replacePetsForUser */
export async function syncPetsForUser(
  userId: string,
  pets: Pet[]
): Promise<{ error: Error | null }> {
  const result = await replacePetsForUser(userId, pets);
  return { error: result.error };
}
