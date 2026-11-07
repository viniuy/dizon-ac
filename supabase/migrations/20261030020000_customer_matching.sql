-- Recognise returning customers. Phone numbers are compared by their last 10 digits,
-- so "0917 123 4567", "+63 917 123 4567" and "09171234567" all match.

alter table public.tickets
  add column if not exists phone_key text
  generated always as (right(regexp_replace(contact_number, '\D', '', 'g'), 10)) stored;

-- Lowercased, single-spaced name for the softer "same name" hint
alter table public.tickets
  add column if not exists name_key text
  generated always as (lower(regexp_replace(trim(contact_name), '\s+', ' ', 'g'))) stored;

create index if not exists tickets_phone_key_idx on public.tickets (phone_key);
create index if not exists tickets_name_key_idx on public.tickets (name_key);
