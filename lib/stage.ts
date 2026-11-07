// What a ticket means right now, in plain words. Combines the stored status with the
// schedule and the current Philippine time, e.g. a confirmed job whose slot is happening
// now is "In progress", and one whose slot has passed still needs closing.

import { TIME_ZONE, type Ticket } from './tickets'

export type Stage =
  | 'needs_approval' | 'upcoming' | 'today' | 'in_progress' | 'needs_closing'
  | 'completed' | 'awaiting_payment' | 'paid' | 'disputed' | 'cancelled' | 'backjob'

interface StageInfo {
  label: string
  /** One line saying what this means and what to do next */
  hint: string
  /** Badge colours */
  badge: string
  dot: string
  /** Staff have something to do */
  needsAction: boolean
}

export const STAGES: Record<Stage, StageInfo> = {
  needs_approval:   { label: 'Needs approval',   hint: 'New request. Pick a schedule and confirm it.',               badge: 'border-amber-300 bg-amber-100 text-amber-900',       dot: 'bg-amber-500',   needsAction: true },
  upcoming:         { label: 'Upcoming',         hint: 'Confirmed and on the Bookings calendar.',                    badge: 'border-sky-200 bg-sky-50 text-sky-800',              dot: 'bg-sky-500',     needsAction: false },
  today:            { label: 'Today',            hint: 'Confirmed for later today.',                                 badge: 'border-blue-300 bg-blue-100 text-blue-900',          dot: 'bg-blue-600',    needsAction: false },
  in_progress:      { label: 'In progress',      hint: 'The job is happening right now.',                            badge: 'border-emerald-600 bg-emerald-600 text-white',       dot: 'bg-emerald-500', needsAction: false },
  needs_closing:    { label: 'Mark as done?',    hint: 'The scheduled time has passed. Mark it completed if the job is done.', badge: 'border-orange-300 bg-orange-100 text-orange-900', dot: 'bg-orange-500', needsAction: true },
  completed:        { label: 'Completed',        hint: 'The job is done.',                                           badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',  dot: 'bg-emerald-600', needsAction: false },
  awaiting_payment: { label: 'Awaiting payment', hint: 'Job done, waiting for the customer to pay.',                 badge: 'border-violet-200 bg-violet-50 text-violet-800',     dot: 'bg-violet-500',  needsAction: false },
  paid:             { label: 'Paid',             hint: 'Done and paid in full.',                                     badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',  dot: 'bg-emerald-600', needsAction: false },
  disputed:         { label: 'Disputed',         hint: 'The customer raised a dispute.',                             badge: 'border-red-300 bg-red-100 text-red-900',             dot: 'bg-red-600',     needsAction: true },
  cancelled:        { label: 'Cancelled',        hint: 'Cancelled. Not on the calendar.',                            badge: 'border-zinc-200 bg-zinc-100 text-zinc-600',          dot: 'bg-zinc-400',    needsAction: false },
  backjob:          { label: 'Backjob',          hint: 'A return visit for an earlier job.',                         badge: 'border-orange-200 bg-orange-50 text-orange-800',     dot: 'bg-orange-500',  needsAction: false },
}

/** Current date ("YYYY-MM-DD") and minutes since midnight in Philippine time */
export function nowPH() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (t: string) => parts.find(p => p.type === t)!.value
  return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))

export type StageInput = Pick<Ticket, 'status' | 'scheduled_date' | 'scheduled_start' | 'scheduled_end'>

export function getStage(t: StageInput, now = nowPH()): Stage {
  switch (t.status) {
    case 'pending_confirmation': return 'needs_approval'
    case 'confirmed': {
      if (!t.scheduled_date) return 'needs_approval'
      if (t.scheduled_date > now.date) return 'upcoming'
      if (t.scheduled_date < now.date) return 'needs_closing'
      const start = t.scheduled_start ? toMin(t.scheduled_start) : 0
      const end = t.scheduled_end ? toMin(t.scheduled_end) : 24 * 60
      return now.minutes < start ? 'today' : now.minutes < end ? 'in_progress' : 'needs_closing'
    }
    default: return t.status
  }
}
