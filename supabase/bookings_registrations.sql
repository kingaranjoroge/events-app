-- Bookings/Registrations
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  num_tickets integer not null default 1 check (num_tickets > 0),
  status text not null default 'confirmed' check (status in ('confirmed','cancelled','waitlisted')),
  created_at timestamptz not null default now()
);



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



-- Bookings policies
drop policy if exists "Users can read their bookings" on public.bookings;
create policy "Users can read their bookings" on public.bookings for select using (auth.uid() = user_id);

drop policy if exists "Users can create their bookings" on public.bookings;
create policy "Users can create their bookings" on public.bookings for insert with check (auth.uid() = user_id);

drop policy if exists "Users can cancel their bookings" on public.bookings;
create policy "Users can cancel their bookings" on public.bookings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
