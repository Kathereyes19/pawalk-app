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

-- Bookings / reservations
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  walker_id text not null,
  walker_name text not null,
  walker_avatar text,
  pet_id uuid references public.pets (id) on delete set null,
  pet_name text not null,
  scheduled_date date not null,
  scheduled_time time not null,
  duration_minutes int not null default 60,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'active', 'completed', 'cancelled')),
  service_price numeric not null default 0,
  platform_fee numeric not null default 0,
  insurance_fee numeric not null default 0,
  total_price numeric not null default 0,
  payment_method text,
  started_at timestamptz,
  completed_at timestamptz,
  summary_distance_km numeric,
  summary_duration_minutes int,
  summary_pace_kmh numeric,
  summary_calories int,
  pet_ids uuid[] not null default '{}',
  pet_names text[] not null default '{}',
  pet_avatars text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_user_id_idx on public.bookings (user_id);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_scheduled_date_idx on public.bookings (scheduled_date desc);

alter table public.bookings enable row level security;

create policy "Users can read own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

-- Multi-pet columns (safe for existing databases)
alter table public.bookings add column if not exists pet_ids uuid[] not null default '{}';
alter table public.bookings add column if not exists pet_names text[] not null default '{}';
alter table public.bookings add column if not exists pet_avatars text[] default '{}';
alter table public.bookings add column if not exists summary_pace_kmh numeric;
alter table public.bookings add column if not exists summary_calories int;
