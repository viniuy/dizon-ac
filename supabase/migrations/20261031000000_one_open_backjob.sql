-- A job can have only one open back job (new or confirmed) at a time. Once it's
-- finished or cancelled, another can be opened if the problem comes back.
-- Enforced here too so two staff clicking at once can't create duplicates.

create unique index if not exists tickets_one_open_backjob
  on public.tickets (parent_ticket_id)
  where is_backjob and status in ('pending_confirmation', 'confirmed');
