-- Pawalk MVP — starter schema for Supabase integration
-- Run in Supabase SQL Editor after creating your project.

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  email text,
  neighborhood text,
  emergency_contact text,
  emergency_phone text,
  avatar_emoji text,
  avatar_url text,
  language text default 'es',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Pets
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  breed text,
  age int,
  weight numeric,
  behaviors text[],
  vaccinated boolean not null default false,
  gender text,
  species text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.pets enable row level security;

create policy "Users can manage own pets"
  on public.pets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Pet vaccinations
create table if not exists public.pet_vaccinations (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  administered_date date,
  next_due_date date,
  card_image_url text,
  created_at timestamptz not null default now()
);

alter table public.pet_vaccinations enable row level security;

create policy "Users can manage own pet vaccinations"
  on public.pet_vaccinations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Bookings (extend when checkout is wired)
-- create table public.bookings (...);
