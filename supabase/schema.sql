-- Profiles (shadow of auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_profile_updated()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
before update on public.profiles
for each row execute function public.handle_profile_updated();

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id) on delete set null,
  title text not null,
  slug text unique not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  tickets_sold integer not null default 0
);

create or replace function public.handle_events_updated()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_events_updated on public.events;
create trigger on_events_updated
before update on public.events
for each row execute function public.handle_events_updated();

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Event <-> Category (many-to-many)
create table if not exists public.event_categories (
  event_id uuid references public.events(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (event_id, category_id)
);

-- Bookings/Registrations
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  num_tickets integer not null default 1 check (num_tickets > 0),
  status text not null default 'confirmed' check (status in ('confirmed','cancelled','waitlisted')),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.categories enable row level security;
alter table public.event_categories enable row level security;
alter table public.bookings enable row level security;

-- Profiles policies
drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles" on public.profiles for select using (true);

drop policy if exists "Users can manage own profile" on public.profiles;
create policy "Users can manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Events policies
drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events" on public.events for select using (is_published = true);

drop policy if exists "Organizers can manage their events" on public.events;
create policy "Organizers can manage their events" on public.events
  for all using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);

drop policy if exists "Authenticated can create events" on public.events;
create policy "Authenticated can create events" on public.events
  for insert with check (auth.uid() = organizer_id);

-- Categories policies
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories for select using (true);

-- Event-Categories policies (read-only publicly)
drop policy if exists "Public can read event_categories" on public.event_categories;
create policy "Public can read event_categories" on public.event_categories for select using (true);

drop policy if exists "Organizers can manage their event categories" on public.event_categories;
create policy "Organizers can manage their event categories" on public.event_categories
  for all using ( exists (
    select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid()
  )) with check ( exists (
    select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid()
  ));

-- Bookings policies
drop policy if exists "Users can read their bookings" on public.bookings;
create policy "Users can read their bookings" on public.bookings for select using (auth.uid() = user_id);

drop policy if exists "Users can create their bookings" on public.bookings;
create policy "Users can create their bookings" on public.bookings for insert with check (auth.uid() = user_id);

drop policy if exists "Users can cancel their bookings" on public.bookings;
create policy "Users can cancel their bookings" on public.bookings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Helper: keep a profile row in sync when users sign up (via Supabase Auth hook)
-- Create edge function or auth trigger in Supabase dashboard if preferred.
-- Example SQL trigger (requires 'uuid-ossp' or use gen_random_uuid and use auth.users):
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- add tickets_sold counter
alter table public.events
add column if not exists tickets_sold integer not null default 0;

-- atomic booking RPC
create or replace function public.create_booking_atomic(
  p_event_id uuid, 
  p_user_id uuid, 
  p_tickets integer
)
returns table (
  booking_id uuid, 
  remaining integer
) as $$
declare
  v_capacity integer;
  v_sold integer;
begin
  select capacity, tickets_sold into v_capacity, v_sold
  from public.events where id = p_event_id for update;

  if not found then
    raise exception 'Event not found';
  end if;

  if v_capacity is null then
    raise exception 'Event capacity not set';
  end if;

  if (v_capacity - v_sold) < p_tickets then
    raise exception 'Not enough seats';
  end if;

  insert into public.bookings (event_id, user_id, num_tickets)
  values (p_event_id, p_user_id, p_tickets)
  returning id into booking_id;

  update public.events set tickets_sold = tickets_sold + p_tickets where id = p_event_id;

  remaining := v_capacity - (v_sold + p_tickets);

  return next;
end;
$$ language plpgsql security definer;


