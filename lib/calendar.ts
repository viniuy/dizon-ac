// Date helpers for the staff calendar. Everything is a plain "YYYY-MM-DD" string
// in Philippine time, so nothing shifts with the server's or browser's time zone.

import { TIME_ZONE } from './tickets'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const MONTH_RE = /^\d{4}-\d{2}$/

const toUTC = (d: string) => new Date(`${d}T00:00:00Z`)
const fromUTC = (d: Date) => d.toISOString().slice(0, 10)

export const isDate = (s: unknown): s is string => typeof s === 'string' && DATE_RE.test(s)

export function todayPH() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date())
}

export function addDays(d: string, n: number) {
  const x = toUTC(d)
  x.setUTCDate(x.getUTCDate() + n)
  return fromUTC(x)
}

/** Same day n months later, clamped to the month's last day (Aug 31 + 6 → Feb 28) */
export function addMonths(d: string, n: number) {
  const [y, m, day] = d.split('-').map(Number)
  const target = new Date(Date.UTC(y, m - 1 + n, 1))
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(day, last))
  return fromUTC(target)
}

/** Saturday of the week (Sunday first, like the calendar) that a date falls in */
export const weekEnd = (d: string) => addDays(d, 6 - toUTC(d).getUTCDay())

export const monthOf = (d: string) => d.slice(0, 7)

export function parseMonth(param: unknown, fallback: string) {
  return typeof param === 'string' && MONTH_RE.test(param) ? param : monthOf(fallback)
}

/** 6 weeks of dates (Sunday first) covering the month */
export function monthGrid(month: string) {
  const first = `${month}-01`
  const start = addDays(first, -toUTC(first).getUTCDay())
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

export function dayLabel(d: string, opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' }) {
  return new Intl.DateTimeFormat('en-PH', { ...opts, timeZone: 'UTC' }).format(toUTC(d))
}
