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
