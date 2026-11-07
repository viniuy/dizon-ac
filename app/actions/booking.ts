'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { validateBooking, type BookingErrors, type BookingField, type BookingForm } from '@/lib/booking'

export type BookingResult = { ok: true } | { ok: false; errors?: BookingErrors; message?: string }

/** Anti-spam signals sent alongside the form */
export interface BotCheck {
  /** Hidden "honeypot" field: people never see it, bots fill it in */
  website: string
  /** Milliseconds between the form appearing and being sent */
  elapsedMs: number
}

const FIELDS: BookingField[] = ['name', 'phone', 'address', 'service', 'date', 'message']

/** Nobody fills in name, phone, address and service this fast */
const MIN_FILL_MS = 3000

export async function submitBooking(input: BookingForm, bot: BotCheck): Promise<BookingResult> {
  // Bots get a normal-looking success so they don't learn what tripped them
  if (bot?.website || !(Number(bot?.elapsedMs) >= MIN_FILL_MS)) return { ok: true }

  const form = Object.fromEntries(FIELDS.map(f => [f, String(input?.[f] ?? '').trim()])) as BookingForm

  const errors = validateBooking(form)
  if (Object.keys(errors).length) return { ok: false, errors }

  // Rate limiting is per device; the database stores only a hash of this
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || null

  const supabase = await createClient()
  // Creates a guest ticket; the public can't insert into or read tickets directly
  const { error } = await supabase.rpc('submit_booking', {
    p_name: form.name,
    p_phone: form.phone,
    p_address: form.address,
    p_service: form.service,
    p_preferred_date: form.date || null,
    p_unit_details: form.message || null,
    p_client_ip: ip,
  })

  if (error?.hint === 'rate_limited' || error?.hint === 'busy') {
    return { ok: false, message: 'We’ve received several requests already. Please call or text us and we’ll sort it out right away.' }
  }
  if (error) {
    console.error('submitBooking', error)
    return { ok: false, message: 'Sorry, we couldn’t send your request. Please call or text us instead.' }
  }
  return { ok: true }
}
