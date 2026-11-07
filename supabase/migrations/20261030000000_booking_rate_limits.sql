-- Spam protection for the public booking form. Limits live in the database so
-- they hold even if someone calls the API directly instead of using the site.
--   • per device (hashed IP): 5 requests / 10 minutes
--   • per phone number: 3 open web requests / day; exact repeats are ignored
--   • overall: 30 web requests / 10 minutes, so a flood can't bury the calendar

create table if not exists public.booking_attempts (
  id         bigint generated always as identity primary key,
  client     text not null,           -- sha256 of the client IP, never the raw IP
  created_at timestamptz not null default now()
);
create index if not exists booking_attempts_client_idx on public.booking_attempts (client, created_at);
create index if not exists booking_attempts_created_idx on public.booking_attempts (created_at);
create index if not exists tickets_source_created_idx on public.tickets (source, created_at);

-- Only submit_booking (security definer) touches this table
alter table public.booking_attempts enable row level security;

drop function if exists public.submit_booking(text, text, text, text, date, text);

create or replace function public.submit_booking(
  p_name text, p_phone text, p_address text, p_service text,
  p_preferred_date date default null, p_unit_details text default null,
  p_client_ip text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_client text := encode(sha256(convert_to(coalesce(nullif(trim(p_client_ip), ''), 'unknown'), 'UTF8')), 'hex');
  v_phone  text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  if char_length(trim(coalesce(p_name, '')))    not between 1 and 120
  or char_length(trim(coalesce(p_phone, '')))   not between 7 and 20
  or char_length(trim(coalesce(p_address, ''))) not between 1 and 300
  or char_length(trim(coalesce(p_service, ''))) not between 1 and 60
  or char_length(coalesce(p_unit_details, ''))  > 2000
  then
    raise exception 'invalid booking' using errcode = '22023';
  end if;

  -- Housekeeping: attempts only matter for a day
  delete from booking_attempts where created_at < now() - interval '1 day';

  if (select count(*) from booking_attempts where client = v_client and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'too many requests' using errcode = 'P0001', hint = 'rate_limited';
  end if;
  insert into booking_attempts (client) values (v_client);

  if (select count(*) from tickets where source = 'web' and created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'too many requests' using errcode = 'P0001', hint = 'busy';
  end if;

  -- Same number asking again for the same service: already have it, don't duplicate
  if exists (
    select 1 from tickets
    where source = 'web' and status = 'pending_confirmation'
      and regexp_replace(contact_number, '\D', '', 'g') = v_phone
      and service_type = trim(p_service)
      and created_at > now() - interval '1 day'
  ) then
    return;
  end if;

  if (
    select count(*) from tickets
    where source = 'web' and status = 'pending_confirmation'
      and regexp_replace(contact_number, '\D', '', 'g') = v_phone
      and created_at > now() - interval '1 day'
  ) >= 3 then
    raise exception 'too many requests' using errcode = 'P0001', hint = 'rate_limited';
  end if;

  insert into tickets (
    source, is_guest, guest_name, guest_phone, contact_name, contact_number,
    address, service_type, unit_details, preferred_date
  ) values (
    'web', true, trim(p_name), trim(p_phone), trim(p_name), trim(p_phone),
    trim(p_address), trim(p_service), nullif(trim(p_unit_details), ''), p_preferred_date
  );
end $$;

revoke execute on function public.submit_booking(text, text, text, text, date, text, text) from public;
grant  execute on function public.submit_booking(text, text, text, text, date, text, text) to anon, authenticated;
