-- "Call this customer to rebook" reminders.
--
-- A follow-up is a date on a finished job: on or after it, the customer shows up on
-- the staff dashboard as someone to call about their next cleaning/service.

alter table public.tickets
  add column if not exists follow_up_date    date,
  add column if not exists follow_up_done_at timestamptz;

-- Dashboard: reminders that are due and not yet handled
create index if not exists tickets_follow_up_due_idx
  on public.tickets (follow_up_date)
  where follow_up_date is not null and follow_up_done_at is null;
