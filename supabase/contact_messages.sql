-- Contact messages table (stores messages from the contact form)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'handled')), 
  created_at timestamptz not null default now()
);



-- Contact messages policies
drop policy if exists "Public can create contact messages" on public.contact_messages;
create policy "Public can create contact messages" on public.contact_messages
  for insert with check (true);

drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages" on public.contact_messages
  for select using (public.is_admin(auth.uid()));

drop policy if exists "Admins can manage contact message status" on public.contact_messages;
create policy "Admins can manage contact message status" on public.contact_messages
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can delete contact messages" on public.contact_messages;
create policy "Admins can delete contact messages" on public.contact_messages
  for delete using (public.is_admin(auth.uid()));