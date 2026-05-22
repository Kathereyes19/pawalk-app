import type { Pet } from '@/types';

export const DOG_VACCINES = [
  'Rabies',
  'Distemper',
  'Parvovirus',
  'Bordetella',
  'Leptospirosis',
] as const;

export const CAT_VACCINES = [
  'Rabies',
  'Feline Triple Vaccine',
  'Feline Leukemia',
  'Rhinotracheitis',
  'Calicivirus',
] as const;

export const CUSTOM_VACCINE_OPTION = 'Otra (personalizada)';

export function getVaccineOptionsForSpecies(species: Pet['species']): string[] {
  const base = species === 'cat' ? [...CAT_VACCINES] : [...DOG_VACCINES];
  return [...base, CUSTOM_VACCINE_OPTION];
}

export const DOG_BREEDS = [
  'Labrador Retriever',
  'Golden Retriever',
  'Pastor Alemán',
  'Bulldog',
  'Beagle',
  'Poodle',
  'Rottweiler',
  'Yorkshire Terrier',
  'Boxer',
  'Dachshund',
  'Chihuahua',
  'Husky Siberiano',
  'Pomerania',
  'Schnauzer',
  'Cocker Spaniel',
  'Otro',
] as const;

export const CAT_BREEDS = [
  'Siamés',
  'Persa',
  'Maine Coon',
  'Bengalí',
  'Ragdoll',
  'British Shorthair',
  'Sphynx',
  'Angora',
  'Mestizo',
  'Otro',
] as const;

export const AVATAR_OPTIONS = {
  dog: ['🐕', '🐶', '🦮', '🐕‍🦺', '🐩'],
  cat: ['🐈', '🐱', '🐈‍⬛', '😺', '😸'],
} as const;
