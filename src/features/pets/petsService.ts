import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import { createPetId, ensurePetId } from '@/lib/petId';
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
    avatar_url:
      avatar.startsWith('http') || avatar.startsWith('data:')
        ? avatar
        : avatar.length <= 4
          ? avatar
          : null,
  };
}

function updatePetsInStorage(userId: string, updater: (pets: Pet[]) => Pet[]): Pet[] {
  const stored = loadStoredUserBundle(userId) ?? {
    onboardingCompleted: false,
    profile: null,
    pets: [],
  };
  const pets = updater(stored.pets);
  saveStoredUserBundle(userId, { ...stored, pets });
  return pets;
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

export type PetInput = Omit<Pet, 'id' | 'vaccinations'> & { id?: string };

export async function createPet(
  userId: string,
  input: PetInput
): Promise<{ pet: Pet | null; error: Error | null }> {
  const pet: Pet = {
    id: ensurePetId(input.id ?? createPetId()),
    name: input.name,
    avatar: input.avatar,
    breed: input.breed,
    age: input.age,
    weight: input.weight,
    behaviors: input.behaviors,
    vaccinated: input.vaccinated ?? false,
    vaccinations: [],
    gender: input.gender,
    species: input.species,
  };

  if (!isSupabaseConfigured()) {
    updatePetsInStorage(userId, (pets) => [...pets, pet]);
    return { pet, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { pet, error: null };
  }

  const row = mapPetToRow(userId, pet);
  const { error } = await supabase.from('pets').insert(row);

  if (error) {
    return { pet: null, error: new Error(error.message) };
  }

  const { pets, error: fetchError } = await fetchPetsByUserId(userId);
  if (fetchError) {
    return { pet, error: fetchError };
  }

  return { pet: pets.find((item) => item.id === pet.id) ?? pet, error: null };
}

export async function updatePet(
  userId: string,
  pet: Pet
): Promise<{ pet: Pet | null; error: Error | null }> {
  const normalized: Pet = {
    ...pet,
    id: ensurePetId(pet.id),
  };

  if (!isSupabaseConfigured()) {
    const pets = updatePetsInStorage(userId, (list) =>
      list.map((item) => (item.id === normalized.id ? normalized : item))
    );
    return { pet: pets.find((item) => item.id === normalized.id) ?? normalized, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { pet: normalized, error: null };
  }

  const row = mapPetToRow(userId, normalized);
  const { id, user_id, ...updates } = row;
  const { error } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return { pet: null, error: new Error(error.message) };
  }

  const { pets, error: fetchError } = await fetchPetsByUserId(userId);
  if (fetchError) {
    return { pet: normalized, error: fetchError };
  }

  return { pet: pets.find((item) => item.id === normalized.id) ?? normalized, error: null };
}

export async function deletePet(
  userId: string,
  petId: string
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    updatePetsInStorage(userId, (pets) => pets.filter((pet) => pet.id !== petId));
    return { error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: null };
  }

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId)
    .eq('user_id', userId);

  return { error: error ? new Error(error.message) : null };
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

  const { data: existingRows, error: fetchError } = await supabase
    .from('pets')
    .select('id')
    .eq('user_id', userId);

  if (fetchError) {
    return { pets: normalized, error: new Error(fetchError.message) };
  }

  const existingIds = new Set((existingRows ?? []).map((row) => row.id as string));
  const incomingIds = new Set(normalized.map((pet) => pet.id));

  const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));
  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('pets')
      .delete()
      .eq('user_id', userId)
      .in('id', idsToDelete);

    if (deleteError) {
      return { pets: normalized, error: new Error(deleteError.message) };
    }
  }

  for (const pet of normalized) {
    const row = mapPetToRow(userId, pet);
    if (existingIds.has(pet.id)) {
      const { id, user_id, ...updates } = row;
      const { error: updateError } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);

      if (updateError) {
        return { pets: normalized, error: new Error(updateError.message) };
      }
    } else {
      const { error: insertError } = await supabase.from('pets').insert(row);
      if (insertError) {
        return { pets: normalized, error: new Error(insertError.message) };
      }
    }
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
