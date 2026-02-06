-- RLS
alter table public.profiles enable row level security;
alter table public.contact_messages enable row level security;
alter table public.events enable row level security;
alter table public.categories enable row level security;
alter table public.event_categories enable row level security;
alter table public.bookings enable row level security;