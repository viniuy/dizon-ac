import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Ticket } from './tickets'

// Matching mirrors the phone_key / name_key columns the database generates
export const phoneKey = (phone: string) => phone.replace(/\D/g, '').slice(-10)
export const nameKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase()

export type PastTicket = Pick<
  Ticket,
  'id' | 'ticket_ref' | 'status' | 'source' | 'contact_name' | 'contact_number' | 'address' | 'service_type' | 'scheduled_date' | 'created_at'
>

const COLS = 'id,ticket_ref,status,source,contact_name,contact_number,address,service_type,scheduled_date,created_at'

/**
 * Earlier tickets from the same customer: a phone match is the same person,
 * a name match with a different number only *might* be.
 */
export async function customerHistory(supabase: SupabaseClient, t: { id?: string; contact_number: string; contact_name?: string }) {
  const phone = phoneKey(t.contact_number)
  const name = t.contact_name ? nameKey(t.contact_name) : ''

  const byPhone = phone.length >= 7
    ? supabase.from('tickets').select(COLS).eq('phone_key', phone).order('created_at', { ascending: false }).limit(20)
    : null
  const byName = name.length >= 3
    ? supabase.from('tickets').select(COLS).eq('name_key', name).neq('phone_key', phone).order('created_at', { ascending: false }).limit(5)
    : null

  const [samePhone, sameName] = await Promise.all([byPhone, byName])
  const notThis = (r: PastTicket) => r.id !== t.id
  return {
    samePhone: ((samePhone?.data ?? []) as PastTicket[]).filter(notThis),
    sameName: ((sameName?.data ?? []) as PastTicket[]).filter(notThis),
  }
}

/** Which of these phone keys belong to customers who've booked more than once */
export async function returningKeys(supabase: SupabaseClient, keys: string[]) {
  const unique = [...new Set(keys.filter(k => k.length >= 7))]
  if (!unique.length) return new Set<string>()
  const { data } = await supabase.from('tickets').select('phone_key').in('phone_key', unique).returns<{ phone_key: string }[]>()
  const counts = new Map<string, number>()
  data?.forEach(r => counts.set(r.phone_key, (counts.get(r.phone_key) ?? 0) + 1))
  return new Set([...counts].filter(([, n]) => n > 1).map(([k]) => k))
}
