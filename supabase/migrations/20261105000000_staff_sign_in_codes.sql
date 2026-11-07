-- Two-step sign-in for staff: after the password, a 6-digit code is emailed to the
-- owners and must be entered before the staff area (and staff data) opens up.
--
-- The code is tied to the Supabase session, so every new sign-in needs a new code.
-- Enforced here in the database, not just in the website: is_staff_or_admin() (used by
-- the RLS policies) now also requires an active account and a verified code for the
-- session making the request. A stolen password alone can't read or change tickets.

create table if not exists public.staff_sign_in_codes (
  session_id  uuid primary key,                      -- auth session (JWT "session_id")
  user_id     uuid not null references auth.users (id) on delete cascade,
  code_hash   text not null,                         -- HMAC of the code; the code itself is never stored
  expires_at  timestamptz not null,
  attempts    smallint not null default 0,           -- wrong guesses for the current code
  sends       smallint not null default 1,           -- codes sent for this session
  sent_at     timestamptz not null default now(),
  verified_at timestamptz
);

-- Only the server (secret key, which bypasses RLS) reads or writes codes
alter table public.staff_sign_in_codes enable row level security;
revoke all on public.staff_sign_in_codes from public, anon, authenticated;

-- Has the session making this request entered its code?
create or replace function public.session_verified() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from staff_sign_in_codes c
    where c.session_id = nullif(auth.jwt() ->> 'session_id', '')::uuid
      and c.user_id = auth.uid()
      and c.verified_at is not null
  );
$$;

-- Signed-in, active staff or admin, code or not: the website uses this to know
-- whether to ask for a code or to turn the account away
create or replace function public.has_staff_role() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('staff', 'admin') and is_active
  );
$$;

-- The gate the RLS policies use: active staff/admin AND a verified code for this session
create or replace function public.is_staff_or_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_staff_role() and public.session_verified();
$$;

-- Same rule for the admin role check; customers are unaffected
create or replace function public.current_role_is(r user_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = r and is_active
      and (r = 'customer' or public.session_verified())
  );
$$;

revoke execute on function public.session_verified() from public, anon;
revoke execute on function public.has_staff_role()   from public, anon;
grant  execute on function public.session_verified() to authenticated;
grant  execute on function public.has_staff_role()   to authenticated;
