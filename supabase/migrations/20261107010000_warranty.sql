-- Warranty on a finished job, set when it's marked completed:
-- 7 days for cleaning, 90 days for repairs (or none).
-- warranty_until is the last covered day, counted from the job's date.

alter table public.tickets
  add column if not exists warranty_days  smallint check (warranty_days in (7, 90)),
  add column if not exists warranty_until date;
