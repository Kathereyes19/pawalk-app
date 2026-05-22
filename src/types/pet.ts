export interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDue: string;
  status: 'current' | 'due-soon' | 'overdue';
  cardImageUrl?: string;
}

export interface Pet {
  id: string;
  name: string;
  avatar: string;
  breed: string;
  age: number;
  weight: number;
  behaviors: string[];
  vaccinated: boolean;
  vaccinations?: Vaccination[];
  gender: 'male' | 'female';
  species: 'dog' | 'cat';
}

/** Row shape for Supabase `pet_vaccinations` */
export interface VaccinationRow {
  id: string;
  pet_id: string;
  user_id: string;
  name: string;
  administered_date: string | null;
  next_due_date: string | null;
  card_image_url: string | null;
  created_at?: string;
}

/** Row shape for Supabase `pets` */
export interface PetRow {
  id: string;
  user_id: string;
  name: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  behaviors: string[] | null;
  vaccinated: boolean;
  gender: string | null;
  species: string | null;
  avatar_url: string | null;
  created_at?: string;
}
