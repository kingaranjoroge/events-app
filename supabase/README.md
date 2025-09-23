## Supabase Database Setup

1. Open your Supabase project's SQL editor.
2. Copy the contents of `supabase/schema.sql` and run it.
3. Verify tables: `profiles`, `events`, `categories`, `event_categories`, `bookings`.
4. Verify RLS policies are enabled and policies exist as defined.

Notes:
- The `profiles` table mirrors `auth.users` via a trigger. If you prefer managing profiles in your app, you can disable the `on_auth_user_created` trigger.
- Policies allow the public to read published events and categories, organizers to manage their own events, and users to manage their own bookings.


