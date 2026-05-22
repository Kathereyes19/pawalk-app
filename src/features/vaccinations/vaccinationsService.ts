import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import { createPetId } from '@/lib/petId';
import { loadStoredUserBundle, saveStoredUserBundle } from '@/lib/userStorage';
import type { Pet, Vaccination, VaccinationRow } from '@/types';

function deriveStatus(nextDue: string): Vaccination['status'] {
  const days = Math.floor(
    (new Date(nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return 'overdue';
  if (days < 30) return 'due-soon';
  return 'current';
}

export function mapRowToVaccination(row: VaccinationRow): Vaccination {
  const nextDue = row.next_due_date ?? row.administered_date ?? '';
  return {
    id: row.id,
    name: row.name,
    date: row.administered_date ?? '',
    nextDue,
    status: deriveStatus(nextDue),
    cardImageUrl: row.card_image_url ?? undefined,
  };
}

function updatePetVaccinationsInStorage(
  userId: string,
  petId: string,
  updater: (vaccinations: Vaccination[]) => Vaccination[]
): Pet[] {
  const stored = loadStoredUserBundle(userId) ?? {
    onboardingCompleted: false,
    profile: null,
    pets: [],
  };
  const pets = stored.pets.map((pet) =>
    pet.id === petId
      ? { ...pet, vaccinations: updater(pet.vaccinations ?? []), vaccinated: true }
      : pet
  );
  saveStoredUserBundle(userId, { ...stored, pets });
  return pets;
}

export async function fetchVaccinationsForPet(
  petId: string
): Promise<{ vaccinations: Vaccination[]; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { vaccinations: [], error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { vaccinations: [], error: null };
  }

  const { data, error } = await supabase
    .from('pet_vaccinations')
    .select('*')
    .eq('pet_id', petId)
    .order('administered_date', { ascending: false });

  if (error) {
    return { vaccinations: [], error: new Error(error.message) };
  }

  return {
    vaccinations: (data as VaccinationRow[]).map(mapRowToVaccination),
    error: null,
  };
}

export interface VaccinationInput {
  name: string;
  date: string;
  nextDue: string;
  cardImageUrl?: string | null;
}

export async function addVaccination(
  userId: string,
  petId: string,
  input: VaccinationInput
): Promise<{ vaccination: Vaccination | null; pets: Pet[] | null; error: Error | null }> {
  const vaccination: Vaccination = {
    id: createPetId(),
    name: input.name,
    date: input.date,
    nextDue: input.nextDue,
    status: deriveStatus(input.nextDue),
    cardImageUrl: input.cardImageUrl ?? undefined,
  };

  if (!isSupabaseConfigured()) {
    const pets = updatePetVaccinationsInStorage(userId, petId, (list) => [...list, vaccination]);
    return { vaccination, pets, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { vaccination: null, pets: null, error: null };
  }

  const { data, error } = await supabase
    .from('pet_vaccinations')
    .insert({
      id: vaccination.id,
      pet_id: petId,
      user_id: userId,
      name: input.name,
      administered_date: input.date,
      next_due_date: input.nextDue,
      card_image_url: input.cardImageUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    return { vaccination: null, pets: null, error: new Error(error.message) };
  }

  return {
    vaccination: mapRowToVaccination(data as VaccinationRow),
    pets: null,
    error: null,
  };
}

export async function deleteVaccination(
  userId: string,
  petId: string,
  vaccinationId: string
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    updatePetVaccinationsInStorage(userId, petId, (list) =>
      list.filter((v) => v.id !== vaccinationId)
    );
    return { error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: null };
  }

  const { error } = await supabase
    .from('pet_vaccinations')
    .delete()
    .eq('id', vaccinationId)
    .eq('user_id', userId);

  return { error: error ? new Error(error.message) : null };
}
