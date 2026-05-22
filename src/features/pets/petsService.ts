import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import { ensurePetId } from '@/lib/petId';
import { loadStoredUserBundle, saveStoredUserBundle } from '@/lib/userStorage';
import { mapRowToVaccination } from '@/features/vaccinations';
import type { Pet, PetRow, VaccinationRow } from '@/types';

type PetRowWithVaccinations = PetRow & {
  pet_vaccinations?: VaccinationRow[] | null;
};

function mapRowToPet(row: PetRowWithVaccinations): Pet {
  const vaccinations = (row.pet_vaccinations ?? []).map(mapRowToVaccination);
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar_url ?? '🐾',
    breed: row.breed ?? '',
    age: row.age ?? 0,
    weight: Number(row.weight ?? 0),
    behaviors: row.behaviors ?? [],
    vaccinated: row.vaccinated || vaccinations.length > 0,
    vaccinations,
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
    avatar_url: avatar.startsWith('http') || avatar.startsWith('data:') ? avatar : avatar.length <= 4 ? avatar : null,
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
    .select('*, pet_vaccinations(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    return { pets: [], error: new Error(error.message) };
  }

  return {
    pets: (data as PetRowWithVaccinations[]).map(mapRowToPet),
    error: null,
  };
}

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

  return fetchPetsByUserId(userId);
}

export async function syncPetsForUser(
  userId: string,
  pets: Pet[]
): Promise<{ error: Error | null }> {
  const result = await replacePetsForUser(userId, pets);
  return { error: result.error };
}
