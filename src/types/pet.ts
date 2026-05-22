export interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDue: string;
  status: 'current' | 'due-soon' | 'overdue';
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

/** Row shape for Supabase `pets` (extend when migrations exist) */
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
