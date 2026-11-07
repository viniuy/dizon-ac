'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { DayButtonProps, DayProps } from 'react-day-picker'
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react'
import { Calendar } from '@/components/ui/calendar'
import { dayLabel } from '@/lib/calendar'
import { STAGES, type Stage } from '@/lib/stage'
import { formatTime, type Ticket } from '@/lib/tickets'
import { cn } from '@/lib/utils'
import { Group, HAIRLINE, ROW_PRESS, STAGGER, SURFACE, TextButton } from './ios'
import { BackjobTag, StageBadge, StageDot } from './ui'

export type CalendarItem = Pick<
  Ticket,
  'id' | 'ticket_ref' | 'status' | 'contact_name' | 'service_type' | 'address' | 'preferred_date' | 'scheduled_date' | 'scheduled_start' | 'scheduled_end' | 'created_at' | 'is_backjob'
>
/** A scheduled job, or a new request shown on the customer's preferred date */
export type CalendarEntry = CalendarItem & { requested: boolean; stage: Stage }

const LEGEND: Stage[] = ['needs_approval', 'upcoming', 'in_progress', 'needs_closing', 'completed']

/** "YYYY-MM" moved by n months */
function shiftMonth(month: string, n: number) {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// "YYYY-MM-DD" ↔ local Date at midnight, which is what the day picker works in
const toDate = (s: string) => new Date(`${s}T00:00:00`)
const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/**
 * Month view built on the shadcn Calendar: its navigation, keyboard support and day buttons,
 * with each day cell extended to list that day's bookings. Picking a day is instant (client
 * state + URL update); changing month loads that month from the server.
 */
export function CalendarBoard({ month, initialDay, today, entries, children }: {
  month: string
  initialDay: string
  today: string
  entries: Record<string, CalendarEntry[]>
  /** Server-rendered side content below the selected day (the to-do lists) */
  children: React.ReactNode
}) {
  const router = useRouter()
  const [day, setDay] = useState(initialDay)
  const [loadingMonth, startMonth] = useTransition()

  const selectDay = (d: string) => {
    setDay(d)
    window.history.replaceState(null, '', `/staff?month=${d.slice(0, 7)}&day=${d}`)
  }
  // Preload the months either side and the current one, so paging months or tapping Today is instant
  useEffect(() => {
    for (const m of [shiftMonth(month, -1), shiftMonth(month, 1)]) router.prefetch(`/staff?month=${m}`)
    router.prefetch(`/staff?month=${today.slice(0, 7)}&day=${today}`)
  }, [month, today, router])

  const goToMonth = (m: string) => startMonth(() => router.push(`/staff?month=${m}`, { scroll: false }))

  const dayEntries = entries[day] ?? []
  const toToday = () => startMonth(() => router.push(`/staff?month=${today.slice(0, 7)}&day=${today}`, { scroll: false }))

  return (
    <div className="grid items-start gap-6 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_360px] xl:grid-rows-[minmax(0,1fr)] xl:items-stretch">
      <section
        aria-label="Calendar"
        className={cn('min-w-0 p-3 transition-opacity sm:p-4 xl:flex xl:min-h-0 xl:flex-col', SURFACE, loadingMonth && 'animate-pulse opacity-60')}
      >
        <Calendar
          mode="single"
          required
          selected={toDate(day)}
          onSelect={d => selectDay(toISO(d))}
          month={toDate(`${month}-01`)}
          onMonthChange={d => goToMonth(toISO(d).slice(0, 7))}
          showOutsideDays
          className="w-full bg-transparent p-0 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col"
          // On laptops the month stretches to fill the card: each week row takes an equal share
          classNames={{
            root: 'w-full',
            months: 'relative w-full xl:flex xl:min-h-0 xl:flex-1 xl:flex-col',
            month: 'flex w-full flex-col gap-2 xl:min-h-0 xl:flex-1',
            nav: 'absolute top-0 right-0 flex items-center gap-1',
            month_caption: 'flex h-9 items-center pl-1',
            caption_label: 'text-[22px] font-bold tracking-[-0.02em]',
            month_grid: 'w-full xl:flex xl:min-h-0 xl:flex-1 xl:flex-col',
            weekdays: 'flex',
            weekday: 'flex-1 pb-1.5 pr-2 text-right text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase',
            weeks: 'xl:flex xl:min-h-0 xl:flex-1 xl:flex-col',
            week: 'flex w-full xl:min-h-0 xl:flex-1',
            day: 'relative min-w-0 flex-1 p-0 align-top',
            today: '',
            outside: '',
            selected: '',
          }}
          components={{
            Day: props => <BookingDay {...props} entries={entries[props.day.isoDate] ?? []} today={today} />,
            DayButton: DateButton,
            // iOS Calendar keeps "Today" up by the month arrows
            Nav: ({ onPreviousClick, onNextClick, previousMonth, nextMonth, className }) => (
              <nav className={className}>
                <TextButton onClick={toToday} className="mr-2 text-[15px]">Today</TextButton>
                <button type="button" aria-label="Previous month" disabled={!previousMonth} onClick={onPreviousClick} className={NAV_BUTTON}>
                  <RiArrowLeftSLine aria-hidden />
                </button>
                <button type="button" aria-label="Next month" disabled={!nextMonth} onClick={onNextClick} className={NAV_BUTTON}>
                  <RiArrowRightSLine aria-hidden />
                </button>
              </nav>
            ),
          }}
        />
        <div className={cn('mt-2 flex shrink-0 flex-wrap items-center gap-x-3.5 gap-y-1 border-t pt-2.5 text-[11px] text-muted-foreground', HAIRLINE)}>
          {LEGEND.map(s => (
            <span key={s} className="flex items-center gap-1.5"><StageDot stage={s} />{STAGES[s].label}</span>
          ))}
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-2 rounded-full border-[1.5px] border-dashed border-amber-500" /> Requested date
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-2 rounded-full bg-rose-500" /> Back job
          </span>
        </div>
      </section>

      <aside className="space-y-5 xl:-mx-2 xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain xl:px-2 xl:pb-2 xl:[scrollbar-width:thin]">
        <Group
          title={<span id="day-title">{dayLabel(day)}</span>}
          action={<span className="text-[13px] font-medium text-muted-foreground tabular-nums">{dayEntries.length || ''}</span>}
        >
          {dayEntries.length === 0 ? (
            <p className="px-4 py-5 text-center text-[15px] text-muted-foreground">Nothing booked.</p>
          ) : (
            <ul key={day} aria-labelledby="day-title" className={STAGGER}>
              {dayEntries.map(e => <AgendaRow key={e.id} entry={e} />)}
            </ul>
          )}
        </Group>
        {children}
      </aside>
    </div>
  )
}

const NAV_BUTTON =
  'grid size-9 place-items-center rounded-full text-primary transition-colors hover:bg-[rgb(118_118_128/0.12)] disabled:opacity-40 [&>svg]:size-5'

/** The day tile: the day button fills it, and the day's bookings sit on top, iOS Calendar style */
function BookingDay({ day, modifiers, entries, today, children, className, ...props }: DayProps & {
  entries: CalendarEntry[]; today: string
}) {
  const isToday = day.isoDate === today
  // Two bookings fit in a cell; with more, show one and a "+N more" line so nothing gets cut off
  const shown = entries.length > 2 ? 1 : 2
  return (
    <td
      {...props}
      className={cn(
        className,
        'h-16 overflow-hidden border-t transition-colors sm:h-28 xl:h-auto',
        HAIRLINE,
        modifiers.selected && 'bg-primary/[0.05]',
        // The date number: red for today, a filled circle for the picked day
        modifiers.selected && '[&_[data-date]]:font-semibold [&_[data-date]]:text-white',
        modifiers.selected && (isToday ? '[&_[data-date]]:bg-[#ff3b30]' : '[&_[data-date]]:bg-primary'),
        !modifiers.selected && isToday && '[&_[data-date]]:font-semibold [&_[data-date]]:text-[#ff3b30]',
      )}
    >
      {children}

      {/* Phones: dots only */}
      {entries.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-0.5 sm:hidden">
          {entries.slice(0, 3).map(e => <EntryDot key={e.id} entry={e} />)}
        </div>
      )}

      <ul className="pointer-events-none absolute inset-x-1 top-9 hidden space-y-px sm:block">
        {entries.slice(0, shown).map(e => (
          <li key={e.id}>
            <Link
              href={`/staff/tickets/${e.id}`}
              className="pointer-events-auto flex items-center gap-1 truncate rounded-[5px] px-1 py-px text-[12px] leading-tight transition-colors hover:bg-[rgb(118_118_128/0.12)]"
            >
              <EntryDot entry={e} />
              {!e.requested && e.scheduled_start && (
                <span className="shrink-0 text-muted-foreground tabular-nums">{formatTime(e.scheduled_start).replace(':00', '')}</span>
              )}
              <span className="truncate font-medium">{e.contact_name}</span>
            </Link>
          </li>
        ))}
        {entries.length > shown && <li className="px-1 text-[11px] font-medium text-muted-foreground">+{entries.length - shown} more</li>}
      </ul>
    </td>
  )
}

/** Stage colour, rose for back jobs, a dashed ring for dates a customer only asked for */
function EntryDot({ entry: e }: { entry: CalendarEntry }) {
  if (e.requested) return <span aria-label="Requested date" className="size-2 shrink-0 rounded-full border-[1.5px] border-dashed border-amber-500" />
  if (e.is_backjob) return <span aria-label="Back job" className="size-2 shrink-0 rounded-full bg-rose-500" />
  return <StageDot stage={e.stage} />
}

/** Invisible button covering the whole tile, so any empty spot selects the day */
function DateButton({ day, modifiers, className, ...props }: DayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  // Keep keyboard navigation working, as shadcn's own day button does
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn(
        className,
        'absolute inset-0 flex h-full w-full items-start justify-end p-1 transition-colors hover:bg-[rgb(118_118_128/0.06)] active:bg-[rgb(118_118_128/0.12)]',
        'focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none',
      )}
    >
      <span
        data-date
        className={cn('inline-grid size-7 place-items-center rounded-full text-[15px] tabular-nums transition-[background-color,color,scale] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]', modifiers.selected ? 'scale-100' : 'scale-95', modifiers.outside && 'text-muted-foreground/45')}
      >
        {day.date.getDate()}
      </span>
    </button>
  )
}

/** iOS Calendar list row: coloured bar, time, then who and what */
function AgendaRow({ entry: e }: { entry: CalendarEntry }) {
  const bar = e.requested ? 'bg-amber-400' : e.is_backjob ? 'bg-rose-500' : STAGES[e.stage].dot
  return (
    <li className={cn('ml-4 border-t first:border-t-0', HAIRLINE)}>
      <Link href={`/staff/tickets/${e.id}`} className={cn('-ml-4 flex items-stretch gap-3 py-2.5 pr-3 pl-4', ROW_PRESS)}>
        <span aria-hidden className={cn('w-[3px] shrink-0 rounded-full', bar)} />
        <span className="w-14 shrink-0 text-[13px] tabular-nums">
          {e.requested ? <span className="text-muted-foreground">Asked</span> : e.scheduled_start && (
            <>
              <span className="block font-medium">{formatTime(e.scheduled_start)}</span>
              {e.scheduled_end && <span className="block text-muted-foreground">{formatTime(e.scheduled_end)}</span>}
            </>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-medium">{e.contact_name}</span>
            {e.is_backjob && <BackjobTag />}
          </span>
          <span className="block truncate text-[13px] text-muted-foreground">{e.service_type} · {e.address}</span>
          <StageBadge stage={e.stage} className="mt-1" />
        </span>
        <RiArrowRightSLine className="size-5 shrink-0 self-center text-muted-foreground/50" aria-hidden />
      </Link>
    </li>
  )
}
