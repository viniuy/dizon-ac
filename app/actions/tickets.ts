'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { deleteBookingEvent, upsertBookingEvent } from '@/lib/google-calendar'
import { dayBookings, monthLoad } from '@/lib/availability'
import { customerHistory, phoneKey } from '@/lib/customers'
import { validateBooking, type BookingErrors, type BookingForm } from '@/lib/booking'
import { requireStaff } from '@/lib/staff'
import {
  CANCELLATION_REASONS, MANUAL_SOURCES, type CancellationReason, type DayBooking, type Ticket, type TicketSource,
} from '@/lib/tickets'

export type TicketActionState = { error?: string; ok?: string }

async function loadTicket(id: string) {
  const { supabase, userId } = await requireStaff()
  const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single<Ticket>()
  if (error || !data) throw new Error('Ticket not found')
  return { supabase, userId, ticket: data }
}

// Calendar, ticket list and ticket page all show this ticket
function done(ok: string): TicketActionState {
  revalidatePath('/staff', 'layout')
  return { ok }
}

/** Other jobs already on a date, for blocking taken start times */
export async function getDayBookings(date: string, excludeId: string): Promise<DayBooking[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return []
  const { supabase } = await requireStaff()
  return dayBookings(supabase, date, excludeId)
}

/** Booked minutes per date for a month, for the date picker's "free time" labels */
export async function getMonthLoad(month: string, excludeId: string): Promise<Record<string, number>> {
  if (!/^\d{4}-\d{2}$/.test(month)) return {}
  const { supabase } = await requireStaff()
  return monthLoad(supabase, month, excludeId)
}

/** Confirm (or reschedule) a ticket and put it on the Bookings calendar */
export async function scheduleTicket(id: string, _prev: TicketActionState, formData: FormData): Promise<TicketActionState> {
  const date = String(formData.get('date') ?? '')
  const time = String(formData.get('time') ?? '')
  const hours = Number(formData.get('hours') ?? 0)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return { error: 'Pick a date and start time.' }
  if (!(hours > 0 && hours <= 12)) return { error: 'Duration must be between 0.5 and 12 hours.' }

  // Schedules are stored as a Philippine-time date plus start/end times, so jobs can't run past midnight
  const [h, m] = time.split(':').map(Number)
  const endMinutes = h * 60 + m + Math.round(hours * 60)
  if (endMinutes > 24 * 60) return { error: 'The job has to end by midnight.' }
  const end = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`

  const { supabase, userId, ticket } = await loadTicket(id)
  if (ticket.status !== 'pending_confirmation' && ticket.status !== 'confirmed') {
    return { error: 'Only new or confirmed tickets can be scheduled.' }
  }

  // One crew, one job at a time: never double-book a slot
  const startMin = h * 60 + m
  const clash = (await dayBookings(supabase, date, id)).find(b =>
    b.scheduled_start && b.scheduled_end &&
    Number(b.scheduled_start.slice(0, 2)) * 60 + Number(b.scheduled_start.slice(3, 5)) < endMinutes &&
    Number(b.scheduled_end.slice(0, 2)) * 60 + Number(b.scheduled_end.slice(3, 5)) > startMin,
  )
  if (clash) return { error: `That time overlaps ${clash.contact_name}'s booking (${clash.ticket_ref}). Pick another slot.` }

  const schedule = { scheduled_date: date, scheduled_start: `${time}:00`, scheduled_end: endMinutes === 24 * 60 ? '23:59:59' : `${end}:00` }
  let eventId: string
  try {
    eventId = await upsertBookingEvent({ ...ticket, ...schedule })
  } catch (e) {
    console.error('scheduleTicket', e)
    return { error: 'Couldn’t update the Bookings calendar, so the ticket wasn’t changed. Check the Google setup.' }
  }

  const { error } = await supabase
    .from('tickets')
    .update({
      ...schedule,
      status: 'confirmed',
      calendar_event_id: eventId,
      ...(ticket.status === 'pending_confirmation' && { assigned_by: userId, assigned_at: new Date().toISOString() }),
    })
    .eq('id', id)
  if (error) return { error: 'Calendar was updated, but saving the ticket failed. Try again.' }

  return done(ticket.status === 'confirmed' ? 'Rescheduled and calendar updated.' : 'Confirmed and added to Bookings.')
}

export async function completeTicket(id: string): Promise<TicketActionState> {
  const { supabase, userId, ticket } = await loadTicket(id)
  if (ticket.status !== 'confirmed') return { error: 'Only confirmed tickets can be marked completed.' }
  const { error } = await supabase
    .from('tickets')
    .update({ status: 'completed', completed_at: new Date().toISOString(), completed_by: userId })
    .eq('id', id)
  return error ? { error: 'Couldn’t update the ticket.' } : done('Marked as completed.')
}

/** Cancelling also removes the calendar event and clears the schedule */
export async function cancelTicket(id: string, reason: string): Promise<TicketActionState> {
  if (!CANCELLATION_REASONS.some(r => r.value === reason)) return { error: 'Choose a cancellation reason.' }
  const { supabase, userId, ticket } = await loadTicket(id)
  if (ticket.status !== 'pending_confirmation' && ticket.status !== 'confirmed') {
    return { error: 'Only new or confirmed tickets can be cancelled.' }
  }

  if (ticket.calendar_event_id) {
    try {
      await deleteBookingEvent(ticket.calendar_event_id)
    } catch (e) {
      console.error('cancelTicket', e)
      return { error: 'Couldn’t remove the calendar event, so the ticket wasn’t cancelled.' }
    }
  }
  const { error } = await supabase
    .from('tickets')
    .update({
      status: 'cancelled',
      cancelled_reason: reason as CancellationReason,
      cancelled_by: userId,
      cancelled_at: new Date().toISOString(),
      calendar_event_id: null,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
    })
    .eq('id', id)
  return error ? { error: 'Couldn’t update the ticket.' } : done('Cancelled.')
}

/**
 * A finished job needs a return visit: open a new ticket linked to it, with the
 * customer's details copied over, ready to be scheduled. The original stays as it was.
 */
export async function createBackjob(id: string, _prev: TicketActionState, formData: FormData): Promise<TicketActionState> {
  const { supabase, userId, ticket } = await loadTicket(id)
  if (!['completed', 'awaiting_payment', 'paid'].includes(ticket.status)) {
    return { error: 'Only finished jobs can have a back job.' }
  }
  // Only one open back job per job; a new one is allowed once that one is done or cancelled
  const { data: open } = await supabase
    .from('tickets')
    .select('ticket_ref')
    .eq('parent_ticket_id', ticket.id)
    .eq('is_backjob', true)
    .in('status', ['pending_confirmation', 'confirmed'])
    .limit(1)
    .maybeSingle<{ ticket_ref: string }>()
  if (open) return { error: `Back job ${open.ticket_ref} is already open for this job. Finish or cancel it first.` }

  const concern = String(formData.get('concern') ?? '').trim().slice(0, 2000)
  const warranty = formData.get('warranty') === 'on'

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      source: ticket.source,
      is_guest: ticket.is_guest,
      guest_name: ticket.contact_name,
      guest_phone: ticket.contact_number,
      contact_name: ticket.contact_name,
      contact_number: ticket.contact_number,
      contact_link: ticket.contact_link,
      address: ticket.address,
      map_url: ticket.map_url,
      service_type: ticket.service_type,
      unit_details: concern || ticket.unit_details,
      is_backjob: true,
      is_warranty_backjob: warranty,
      parent_ticket_id: ticket.id,
      created_by: userId,
    })
    .select('id')
    .single<{ id: string }>()
  if (error?.code === '23505') {
    // Someone else opened one a moment ago (unique index tickets_one_open_backjob)
    return { error: 'A back job is already open for this job. Refresh to see it.' }
  }
  if (error || !data) {
    console.error('createBackjob', error)
    return { error: 'Couldn’t create the back job. Try again.' }
  }

  revalidatePath('/staff', 'layout')
  // Straight to the new ticket so a new schedule gets picked
  redirect(`/staff/tickets/${data.id}`)
}

export async function saveNotes(id: string, _prev: TicketActionState, formData: FormData): Promise<TicketActionState> {
  const notes = String(formData.get('notes') ?? '').trim().slice(0, 4000) || null
  const { supabase, ticket } = await loadTicket(id)
  const { error } = await supabase.from('tickets').update({ staff_notes: notes }).eq('id', id)
  if (error) return { error: 'Couldn’t save notes.' }

  // Keep the calendar event's description in sync
  if (ticket.calendar_event_id && ticket.scheduled_date && ticket.scheduled_start && ticket.scheduled_end) {
    try {
      await upsertBookingEvent({ ...ticket, staff_notes: notes })
    } catch (e) {
      console.error('saveNotes', e)
      return { ok: 'Notes saved, but the calendar event couldn’t be updated.' }
    }
  }
  return done('Notes saved.')
}

export type DetailsState = TicketActionState & { fieldErrors?: BookingErrors }

/** Staff corrections to the customer's details (typo in the address, new number, etc.) */
export async function saveDetails(id: string, _prev: DetailsState, formData: FormData): Promise<DetailsState> {
  const form: BookingForm = {
    name: String(formData.get('name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    address: String(formData.get('address') ?? '').trim(),
    service: String(formData.get('service') ?? '').trim(),
    date: String(formData.get('date') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim(),
  }
  const { supabase, ticket } = await loadTicket(id)

  const fieldErrors = validateBooking(form)
  // Older tickets (chat, phone) may use a service name that isn't on the website's list
  if (form.service && form.service === ticket.service_type) delete fieldErrors.service
  if (Object.keys(fieldErrors).length) return { fieldErrors }

  const changes = {
    contact_name: form.name,
    contact_number: form.phone,
    address: form.address,
    service_type: form.service,
    preferred_date: form.date || null,
    unit_details: form.message || null,
    // Cleared so the database rebuilds the Maps link from the new address
    ...(form.address !== ticket.address && { map_url: null }),
  }
  const { data: updated, error } = await supabase.from('tickets').update(changes).eq('id', id).select('*').single<Ticket>()
  if (error || !updated) return { error: 'Couldn’t save the changes. Try again.' }

  // A scheduled job's calendar event shows these details, so refresh it
  if (updated.calendar_event_id && updated.scheduled_date && updated.scheduled_start && updated.scheduled_end) {
    try {
      await upsertBookingEvent(updated)
    } catch (e) {
      console.error('saveDetails', e)
      revalidatePath('/staff', 'layout')
      return { ok: 'Details saved, but the calendar event couldn’t be updated.' }
    }
  }
  return done('Details saved.')
}

export type CreateState = { error?: string; fieldErrors?: BookingErrors & { link?: string } }

/** Staff add a booking that came in outside the website (Facebook, a call, chat) */
export async function createTicket(_prev: CreateState, formData: FormData): Promise<CreateState> {
  const { supabase, userId } = await requireStaff()

  const form: BookingForm = {
    name: String(formData.get('name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    address: String(formData.get('address') ?? '').trim(),
    service: String(formData.get('service') ?? '').trim(),
    date: String(formData.get('date') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim(),
  }
  const source = String(formData.get('source') ?? '') as TicketSource
  const link = String(formData.get('link') ?? '').trim()

  const fieldErrors: CreateState['fieldErrors'] = validateBooking(form)
  if (link && (!/^https?:\/\/\S+$/i.test(link) || link.length > 500)) fieldErrors.link = 'Paste the full link, starting with https://'
  if (!MANUAL_SOURCES.includes(source)) return { error: 'Choose where the booking came from.' }
  if (Object.keys(fieldErrors).length) return { fieldErrors }

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      source,
      is_guest: true,
      guest_name: form.name,
      guest_phone: form.phone,
      contact_name: form.name,
      contact_number: form.phone,
      contact_link: link || null,
      address: form.address,
      service_type: form.service,
      preferred_date: form.date || null,
      unit_details: form.message || null,
      created_by: userId,
    })
    .select('id')
    .single<{ id: string }>()
  if (error || !data) {
    console.error('createTicket', error)
    return { error: 'Couldn’t create the ticket. Try again.' }
  }

  revalidatePath('/staff', 'layout')
  // Straight to the new ticket, ready to schedule
  redirect(`/staff/tickets/${data.id}`)
}

export type CustomerMatch = { name: string; phone: string; address: string; count: number; lastService: string; lastTicketId: string } | null

/** New-ticket form: has this number booked with us before? */
export async function lookupCustomer(phone: string): Promise<CustomerMatch> {
  if (phoneKey(String(phone ?? '')).length < 10) return null
  const { supabase } = await requireStaff()
  const { samePhone } = await customerHistory(supabase, { contact_number: phone })
  const last = samePhone[0]
  return last
    ? { name: last.contact_name, phone: last.contact_number, address: last.address, count: samePhone.length, lastService: last.service_type, lastTicketId: last.id }
    : null
}
