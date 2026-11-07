import 'server-only'
import { createSign } from 'node:crypto'
import { TIME_ZONE, type Ticket } from './tickets'

/*
  Talks to the "Bookings" Google Calendar as a service account.
  Setup: create a service account in Google Cloud, enable the Calendar API,
  then share the Bookings calendar with the service account's email
  ("Make changes to events"). See .env.example for the variables.
*/

const SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const API = 'https://www.googleapis.com/calendar/v3'
const BACKJOB_COLOR_ID = '4'

let cached: { token: string; expires: number } | null = null

function config() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  if (!email || !key || !calendarId) {
    throw new Error('Google Calendar is not configured (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID)')
  }
  return { email, key, calendarId }
}

const b64url = (s: string | Buffer) => Buffer.from(s).toString('base64url')

/** OAuth access token via a signed JWT (service-account flow), cached until shortly before expiry */
async function accessToken() {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token

  const { email, key } = config()
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(
    JSON.stringify({ iss: email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }),
  )}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key)

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${b64url(signature)}`,
    }),
  })
  if (!res.ok) throw new Error(`Google auth failed: ${res.status} ${await res.text()}`)
  const { access_token, expires_in } = (await res.json()) as { access_token: string; expires_in: number }
  cached = { token: access_token, expires: Date.now() + expires_in * 1000 }
  return access_token
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T | null> {
  const { calendarId } = config()
  const res = await fetch(`${API}/calendars/${encodeURIComponent(calendarId)}${path}`, {
    method,
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  // Deleting an event that's already gone is fine
  if (method === 'DELETE' && (res.status === 404 || res.status === 410)) return null
  if (!res.ok) throw new Error(`Google Calendar ${method} ${path} failed: ${res.status} ${await res.text()}`)
  return res.status === 204 ? null : ((await res.json()) as T)
}

/** Ticket must have scheduled_date/start/end set (Philippine local time) */
function eventBody(ticket: Ticket) {
  const at = (time: string) => `${ticket.scheduled_date}T${time.slice(0, 5)}:00`
  const lines = [
    `${ticket.ticket_ref} · ${ticket.service_type}`,
    ticket.is_backjob && `BACK JOB (return visit${ticket.is_warranty_backjob ? ', under warranty' : ''})`,
    `Customer: ${ticket.contact_name}`,
    `Phone: ${ticket.contact_number}`,
    `Address: ${ticket.address}`,
    ticket.map_url && `Map: ${ticket.map_url}`,
    ticket.unit_details && `\nUnit details:\n${ticket.unit_details}`,
    ticket.problem_description && `\nProblem:\n${ticket.problem_description}`,
    ticket.staff_notes && `\nStaff notes:\n${ticket.staff_notes}`,
  ]
  return {
    summary: `${ticket.is_backjob ? 'BACK JOB · ' : ''}${ticket.service_type} — ${ticket.contact_name}`,
    // Google's "Flamingo" for back jobs, so return visits stand out; null keeps the calendar's colour
    colorId: ticket.is_backjob ? BACKJOB_COLOR_ID : null,
    location: ticket.address,
    description: lines.filter(Boolean).join('\n'),
    start: { dateTime: at(ticket.scheduled_start!), timeZone: TIME_ZONE },
    end: { dateTime: at(ticket.scheduled_end!), timeZone: TIME_ZONE },
    extendedProperties: { private: { ticketId: ticket.id, ticketRef: ticket.ticket_ref } },
  }
}

/** Creates the event, or updates it if the ticket already has one. Returns the event id. */
export async function upsertBookingEvent(ticket: Ticket) {
  const body = eventBody(ticket)
  const event = ticket.calendar_event_id
    ? await call<{ id: string }>('PATCH', `/events/${encodeURIComponent(ticket.calendar_event_id)}`, body)
    : await call<{ id: string }>('POST', '/events', body)
  return event!.id
}

export async function deleteBookingEvent(eventId: string) {
  await call('DELETE', `/events/${encodeURIComponent(eventId)}`)
}
