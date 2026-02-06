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



-- add tickets_sold counter (done)
alter table public.events
add column if not exists tickets_sold integer not null default 0;




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



-- Events policies
drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events" on public.events for select using (is_published = true);

drop policy if exists "Organizers can manage their events" on public.events;
create policy "Organizers can manage their events" on public.events
  for all using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);

drop policy if exists "Authenticated can create events" on public.events;
create policy "Authenticated can create events" on public.events
  for insert with check (auth.uid() = organizer_id);

drop policy if exists "Admins can manage all events" on public.events;
create policy "Admins can manage all events" on public.events
  for all using (public.is_admin(auth.uid()));