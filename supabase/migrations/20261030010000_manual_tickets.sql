-- Staff-entered tickets for customers who book outside the website (Facebook, calls, chat).
-- Staff can already insert tickets under the existing "tickets: staff create" policy.

alter type public.ticket_source add value if not exists 'facebook';

-- Where to reach the customer besides their phone, e.g. their Messenger conversation
alter table public.tickets
  add column if not exists contact_link text check (char_length(contact_link) <= 500);
