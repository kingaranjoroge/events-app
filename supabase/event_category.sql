-- Event <-> Category (many-to-many)
create table if not exists public.event_categories (
  event_id uuid references public.events(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (event_id, category_id)
);



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