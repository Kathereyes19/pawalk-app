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

-- Service category columns (walk / care / veterinary)
alter table public.bookings add column if not exists service_category text default 'walkers'
  check (service_category in ('walkers', 'caregivers', 'veterinary'));
alter table public.bookings add column if not exists service_type text;
alter table public.bookings add column if not exists selected_service_id text;
alter table public.bookings add column if not exists selected_service_name text;
alter table public.bookings add column if not exists care_instructions text;
alter table public.bookings add column if not exists is_overnight boolean default false;
alter table public.bookings add column if not exists institution_address text;

-- Saved payment methods (tokenized metadata only — never store full PAN/CVV)
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  brand text not null check (brand in ('visa', 'mastercard', 'amex', 'unknown')),
  last4 text not null check (char_length(last4) = 4),
  exp_month int not null check (exp_month between 1 and 12),
  exp_year int not null check (exp_year >= 2020),
  cardholder_name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_methods_user_id_idx on public.payment_methods (user_id);
create unique index if not exists payment_methods_one_default_per_user
  on public.payment_methods (user_id)
  where is_default;

alter table public.payment_methods enable row level security;

create policy "Users can manage own payment methods"
  on public.payment_methods for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Pet care reminders
create table if not exists public.pet_care_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete set null,
  pet_name text,
  title text not null,
  category text not null check (
    category in ('vaccination', 'medication', 'deworming', 'walks', 'feeding', 'grooming', 'vet_visit')
  ),
  notes text,
  due_date date not null,
  due_time time not null default '09:00',
  is_completed boolean not null default false,
  completed_at timestamptz,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pet_care_reminders_user_id_idx on public.pet_care_reminders (user_id);
create index if not exists pet_care_reminders_due_idx on public.pet_care_reminders (user_id, due_date, due_time);

alter table public.pet_care_reminders enable row level security;

create policy "Users can manage own pet care reminders"
  on public.pet_care_reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Marketplace products catalog
create table if not exists public.marketplace_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null check (
    category in ('food', 'grooming', 'toys', 'veterinary', 'services')
  ),
  price numeric not null check (price >= 0),
  rating numeric not null default 0 check (rating >= 0 and rating <= 5),
  review_count int not null default 0 check (review_count >= 0),
  short_description text not null,
  description text not null,
  image_emoji text not null default '🛍️',
  image_url text,
  gallery text[] not null default '{}',
  in_stock boolean not null default true,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_products_category_idx on public.marketplace_products (category);
create index if not exists marketplace_products_price_idx on public.marketplace_products (price);

alter table public.marketplace_products enable row level security;

create policy "Anyone authenticated can read marketplace products"
  on public.marketplace_products for select
  using (auth.role() = 'authenticated');

-- Marketplace orders
create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  items jsonb not null default '[]',
  subtotal numeric not null check (subtotal >= 0),
  delivery_address text not null,
  payment_method_label text not null,
  payment_method_id uuid references public.payment_methods (id) on delete set null,
  status text not null default 'confirmed' check (
    status in ('pending', 'confirmed', 'delivered', 'cancelled')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_orders_user_id_idx on public.marketplace_orders (user_id);
create index if not exists marketplace_orders_created_idx on public.marketplace_orders (user_id, created_at desc);

alter table public.marketplace_orders enable row level security;

create policy "Users can manage own marketplace orders"
  on public.marketplace_orders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
