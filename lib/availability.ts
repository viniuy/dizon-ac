import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { WORK_END, WORK_START, type DayBooking, type Ticket } from './tickets'

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))

/** Booked minutes inside working hours, per date, for one month ("YYYY-MM") */
export async function monthLoad(supabase: SupabaseClient, month: string, excludeId: string) {
  const [y, m] = month.split('-').map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const { data } = await supabase
    .from('tickets')
    .select('scheduled_date,scheduled_start,scheduled_end')
    .gte('scheduled_date', `${month}-01`)
    .lte('scheduled_date', `${month}-${String(last).padStart(2, '0')}`)
    .neq('status', 'cancelled')
    .neq('id', excludeId)
    .returns<Pick<Ticket, 'scheduled_date' | 'scheduled_start' | 'scheduled_end'>[]>()

  const load: Record<string, number> = {}
  for (const t of data ?? []) {
    if (!t.scheduled_date || !t.scheduled_start || !t.scheduled_end) continue
    const mins = Math.min(WORK_END, toMin(t.scheduled_end)) - Math.max(WORK_START, toMin(t.scheduled_start))
    if (mins > 0) load[t.scheduled_date] = (load[t.scheduled_date] ?? 0) + mins
  }
  return load
}

/** Other jobs already on a date */
export async function dayBookings(supabase: SupabaseClient, date: string, excludeId: string) {
  const { data } = await supabase
    .from('tickets')
    .select('id,ticket_ref,status,contact_name,service_type,address,scheduled_start,scheduled_end')
    .eq('scheduled_date', date)
    .neq('status', 'cancelled')
    .neq('id', excludeId)
    .order('scheduled_start')
    .returns<DayBooking[]>()
  return data ?? []
}
