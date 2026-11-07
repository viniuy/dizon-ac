-- Web bookings + Google Calendar sync on top of the existing ticketing schema.
-- Additive only, plus two security fixes on existing objects.

-- ── Tickets: web source, preferred date, calendar link, staff notes ──────────
alter type public.ticket_source add value if not exists 'web';

alter table public.tickets
  add column if not exists preferred_date    date,
  add column if not exists calendar_event_id text,
  add column if not exists staff_notes       text check (char_length(staff_notes) <= 4000);

-- The landing-page form creates guest tickets through this function only.
-- Tickets stay staff-insert-only under RLS; anon can't read anything back.
create or replace function public.submit_booking(
  p_name text, p_phone text, p_address text, p_service text,
  p_preferred_date date default null, p_unit_details text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if char_length(trim(coalesce(p_name, '')))    not between 1 and 120
  or char_length(trim(coalesce(p_phone, '')))   not between 7 and 20
  or char_length(trim(coalesce(p_address, ''))) not between 1 and 300
  or char_length(trim(coalesce(p_service, ''))) not between 1 and 60
  or char_length(coalesce(p_unit_details, ''))  > 2000
  then
    raise exception 'invalid booking' using errcode = '22023';
  end if;

  insert into tickets (
    source, is_guest, guest_name, guest_phone, contact_name, contact_number,
    address, service_type, unit_details, preferred_date
  ) values (
    'web', true, trim(p_name), trim(p_phone), trim(p_name), trim(p_phone),
    trim(p_address), trim(p_service), nullif(trim(p_unit_details), ''), p_preferred_date
  );
end $$;

revoke execute on function public.submit_booking(text, text, text, text, date, text) from public;
grant  execute on function public.submit_booking(text, text, text, text, date, text) to anon, authenticated;

-- ── Security fix: users could promote themselves via "profiles: own update" ──
create or replace function public.guard_profile_privileges() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for the service role / SQL editor, which may change anything
  if auth.uid() is not null
     and (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not current_role_is('admin')
  then
    raise exception 'only admins can change role or active status' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger guard_profile_privileges before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- ── Security fix: pin search_path on existing SECURITY DEFINER functions ────
alter function public.handle_new_user()         set search_path = public;
alter function public.current_role_is(user_role) set search_path = public;
alter function public.is_staff_or_admin()        set search_path = public;
alter function public.generate_ticket_ref()      set search_path = public;
alter function public.set_map_url()              set search_path = public;
alter function public.touch_updated_at()         set search_path = public;

-- Trigger functions shouldn't be callable through the API
revoke execute on function public.handle_new_user()          from public, anon, authenticated;
revoke execute on function public.guard_profile_privileges() from public, anon, authenticated;
