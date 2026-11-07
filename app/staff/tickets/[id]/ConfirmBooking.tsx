'use client'

import { useActionState, useState, useTransition } from 'react'
import {
  RiAlertLine, RiArrowRightLine, RiCalendarLine, RiChatQuoteLine, RiCheckLine, RiLoader4Line, RiMapPin2Line,
  RiTempColdLine, RiUser3Line, type RemixiconComponentType,
} from '@remixicon/react'
import { getDayBookings, getMonthLoad, scheduleTicket, type TicketActionState } from '@/app/actions/tickets'
import { Button } from '@/components/ui/button'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { dayLabel } from '@/lib/calendar'
import { CLOSED_WEEKDAYS, formatTime, isClosedDay, WORK_END, WORK_START, type DayBooking, type Ticket } from '@/lib/tickets'
import { cn } from '@/lib/utils'
import { SlotsSkeleton } from '../../skeletons'
import { Group, GroupLabel, HAIRLINE, IOS_TYPE, REVEAL, Segmented, SHEET, TextButton } from '../../ios'

export type BookingSummary = Pick<
  Ticket,
  'id' | 'ticket_ref' | 'contact_name' | 'contact_number' | 'address' | 'map_url' | 'service_type' | 'unit_details' | 'problem_description' | 'preferred_date'
>

// 30-minute start slots, 7:00 AM to 6:00 PM
const SLOTS = Array.from({ length: 23 }, (_, i) => {
  const m = 7 * 60 + i * 30
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
})
const DURATIONS = [1, 1.5, 2, 3, 4, 6]

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
/** "6h free", "Open", "Full" */
const freeLabel = (mins: number, long = false) =>
  mins >= WORK_END - WORK_START ? (long ? 'Nothing booked yet' : 'Open')
    : mins < 60 ? 'Full'
      : `${Math.floor(mins / 60)}${mins % 60 >= 30 ? '.5' : ''}h free`
const durationLabel = (h: number) => (h < 1 ? `${h * 60} min` : `${h} hr${h === 1 ? '' : 's'}`)

// "YYYY-MM-DD" ↔ local Date at midnight, for the date picker
const toDate = (s: string) => (s ? new Date(`${s}T00:00:00`) : undefined)
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }
const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function ConfirmBooking({ ticket, confirmed, date: initialDate, time: initialTime, hours: initialHours, initialLoad, initialDayBookings }: {
  ticket: BookingSummary
  confirmed: boolean
  date: string
  time: string
  hours: number
  /** Booked minutes per date for the month first shown */
  initialLoad: Record<string, number>
  /** Other jobs on the initial date */
  initialDayBookings: DayBooking[]
}) {
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(SLOTS.includes(initialTime) ? initialTime : '09:00')
  const [hours, setHours] = useState(DURATIONS.includes(initialHours) ? initialHours : 2)
  const [dateOpen, setDateOpen] = useState(!initialDate)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [load, setLoad] = useState(initialLoad)
  const [dayList, setDayList] = useState(initialDayBookings)
  const [loadingDay, startLoadingDay] = useTransition()
  const [loadingMonth, startLoadingMonth] = useTransition()

  const [state, action, pending] = useActionState(async (prev: TicketActionState, formData: FormData) => {
    const result = await scheduleTicket(ticket.id, prev, formData)
    if (result.ok) setReviewOpen(false)
    return result
  }, {})

  const freeMinutes = (d: string) => WORK_END - WORK_START - (load[d] ?? 0)
  const overlapping = (from: number, to: number) => dayList.filter(b =>
    b.scheduled_start && b.scheduled_end && toMin(b.scheduled_start) < to && toMin(b.scheduled_end) > from,
  )

  const start = toMin(time)
  const end = start + hours * 60
  const pastMidnight = end > 24 * 60
  const clashes = overlapping(start, end)
  // Start times already gone today can't be booked
  const now = new Date()
  const nowMinutes = date === toISO(now) ? now.getHours() * 60 + now.getMinutes() : -1
  const timeOk = !pastMidnight && clashes.length === 0 && start > nowMinutes

  const pickDate = (d: string) => {
    setDate(d)
    setDateOpen(false)
    startLoadingDay(async () => setDayList(await getDayBookings(d, ticket.id)))
  }
  const showMonth = (m: Date) => startLoadingMonth(async () => {
    const more = await getMonthLoad(toISO(m).slice(0, 7), ticket.id)
    setLoad(prev => ({ ...prev, ...more }))
  })

  const folded = !!date && !dateOpen
  const shortDay = (d: string) => dayLabel(d, { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    // Lays itself out by the room it has: calendar beside the times and summary when wide,
    // stacked sections (calendar folding away once a date is picked) when narrow
    <div className="@container">
      <div className="grid gap-x-6 gap-y-5 @lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] @[44rem]:gap-x-8 @[44rem]:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        {/* ── Date: calendar with free time ─────────── */}
        <Section title="Date" className="@lg:row-span-2">
          {folded && (
            <div className="flex items-center gap-3 rounded-xl bg-[rgb(118_118_128/0.08)] px-3.5 py-2.5 @lg:hidden">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{dayLabel(date)}</p>
                <p className="text-xs text-muted-foreground">{freeLabel(freeMinutes(date), true)}</p>
              </div>
              <TextButton onClick={() => setDateOpen(true)}>Change</TextButton>
            </div>
          )}
          <div className={cn(folded && 'hidden @lg:block')}>
            <div className={cn('transition-opacity', loadingMonth && 'animate-pulse opacity-60')}>
              <Calendar
                mode="single"
                selected={date ? toDate(date) : undefined}
                defaultMonth={date ? toDate(date) : undefined}
                onSelect={d => d && pickDate(toISO(d))}
                onMonthChange={showMonth}
                disabled={[{ before: startOfToday() }, { dayOfWeek: CLOSED_WEEKDAYS }, d => freeMinutes(toISO(d)) < 60]}
                modifiers={ticket.preferred_date ? { preferred: toDate(ticket.preferred_date)! } : undefined}
                className="w-full p-0 [--cell-size:--spacing(10)] @lg:[--cell-size:--spacing(9)] @[44rem]:[--cell-size:--spacing(10)]"
                // iOS Calendar: month name on the left, blue chevrons on the right, caps weekdays
                classNames={{
                  root: 'w-full',
                  month: 'flex w-full flex-col gap-2',
                  month_caption: 'flex h-(--cell-size) items-center px-1',
                  caption_label: 'text-[15px] font-semibold select-none',
                  nav: 'absolute inset-x-0 top-0 flex items-center justify-end',
                  button_previous: NAV_BUTTON,
                  button_next: NAV_BUTTON,
                  weekday: 'flex-1 text-[11px] font-semibold text-muted-foreground/70 uppercase select-none',
                  today: '',
                }}
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- drop the default label, we render our own
                  DayButton: ({ children: _label, ...props }) => {
                    const { selected, today, outside, disabled, preferred } = props.modifiers
                    const free = freeMinutes(toISO(props.day.date))
                    return (
                      <CalendarDayButton
                        {...props}
                        className="rounded-xl hover:bg-transparent data-[selected-single=true]:bg-transparent data-[selected-single=true]:text-foreground"
                      >
                        <div className="flex flex-col items-center gap-0.5 leading-none">
                          {/* The day number sits in a circle: filled blue when picked, red text for today */}
                          <span
                            className={cn(
                              'grid size-7 place-items-center rounded-full text-[15px] tabular-nums transition-colors',
                              selected
                                ? 'bg-primary font-semibold text-white shadow-[0_2px_6px_rgb(31_111_209/0.35)]'
                                : today
                                  ? 'font-semibold text-[#ff3b30]'
                                  : !disabled && !outside && 'group-hover/day:bg-[rgb(118_118_128/0.12)]',
                              preferred && !selected && 'ring-[1.5px] ring-amber-400',
                            )}
                          >
                            {props.day.date.getDate()}
                          </span>
                          {!outside && !disabled ? (
                            <span className={cn('text-[9px] font-medium', free < WORK_END - WORK_START ? 'text-amber-600' : 'text-emerald-600')}>
                              {freeLabel(free)}
                            </span>
                          ) : !outside && isClosedDay(toISO(props.day.date)) ? (
                            <span className="text-[9px] font-medium text-muted-foreground/70">Closed</span>
                          ) : (
                            <span aria-hidden className="h-[9px]" />
                          )}
                        </div>
                      </CalendarDayButton>
                    )
                  },
                }}
              />
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-1.5 px-1 text-[11px] text-muted-foreground">
              Free time shows under each date.
              {ticket.preferred_date && (
                <>
                  <span aria-hidden className="ml-1 inline-block size-2.5 rounded-full ring-[1.5px] ring-amber-400" />
                  Customer prefers {shortDay(ticket.preferred_date)}
                </>
              )}
            </p>
          </div>
        </Section>

        {date ? (
          <div key={date} className={cn('space-y-5', REVEAL, dateOpen && 'hidden @lg:block')}>
            {/* ── Duration ──────────────────────────────── */}
            <Section title="Duration">
              <Segmented
                label="How long is the job"
                options={DURATIONS.map(h => ({ value: h, label: `${h}h` }))}
                value={hours}
                onChange={setHours}
              />
            </Section>

            {/* ── Start time: taken slots are struck through ── */}
            <Section title="Start time">
              {loadingDay ? (
                <SlotsSkeleton />
              ) : (
                (['Morning', 'Afternoon'] as const).map(part => (
                  <div key={part} className="mb-3 last:mb-0">
                    <p className="mb-1.5 text-xs text-muted-foreground">{part}</p>
                    <div className="grid grid-cols-6 gap-1.5 @lg:grid-cols-5 @[44rem]:grid-cols-6">
                      {SLOTS.filter(s => (part === 'Morning' ? s < '12:00' : s >= '12:00')).map(s => {
                        const from = toMin(s)
                        const taken = overlapping(from, from + hours * 60)
                        const past = from <= nowMinutes
                        return (
                          <Choice
                            key={s}
                            pressed={time === s && !taken.length && !past}
                            disabled={taken.length > 0 || past}
                            title={taken.length ? `Booked: overlaps ${taken.map(b => b.contact_name).join(', ')}` : undefined}
                            onClick={() => setTime(s)}
                          >
                            {/* AM / PM is already in the Morning / Afternoon heading */}
                            {formatTime(s).replace(/\s?[AP]M$/i, '')}
                          </Choice>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </Section>
          </div>
        ) : (
          <p className="hidden items-center justify-center gap-2 rounded-xl bg-[rgb(118_118_128/0.06)] p-6 text-center text-[13px] text-muted-foreground @lg:flex">
            <RiCalendarLine className="size-4 shrink-0" aria-hidden /> Pick a date to see its open start times.
          </p>
        )}

        {/* ── Summary + review: under the times when wide, at the end when narrow ── */}
        {date && (
          <div className={cn('flex items-center gap-3 self-end border-t pt-4', HAIRLINE, dateOpen && 'hidden @lg:flex')}>
            {timeOk ? (
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold">{shortDay(date)}</p>
                <p className="text-[13px] text-muted-foreground tabular-nums">
                  {formatTime(time)} – {formatTime(fromMin(end))} · {durationLabel(hours)}
                </p>
              </div>
            ) : (
              <p className="flex min-w-0 items-center gap-1.5 text-[13px] text-amber-700">
                <RiAlertLine className="size-4 shrink-0" aria-hidden />
                {clashes.length ? `${formatTime(time)} is taken for a ${durationLabel(hours)} job.` : 'Pick a start time.'}
              </p>
            )}
            <Button
              type="button"
              className={cn('group ml-auto shrink-0', PILL)}
              disabled={!timeOk || loadingDay}
              onClick={() => setReviewOpen(true)}
            >
              {confirmed ? 'Review' : 'Review & book'}
              <RiArrowRightLine className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </Button>
          </div>
        )}
      </div>

      {state.ok && !reviewOpen && <p role="status" className="mt-3 text-[13px] text-emerald-700">{state.ok}</p>}

      {/* ── Review: a minimal iOS sheet, laid out like an event in iOS Calendar ── */}
      <Dialog open={reviewOpen} onOpenChange={open => !pending && setReviewOpen(open)}>
        <DialogContent showCloseButton={false} className={cn(IOS_TYPE, SHEET, 'max-h-[92dvh] overflow-y-auto sm:max-w-[26rem]')}>
          {/* Grabber (phones) and nav bar: Cancel, centred title */}
          <div aria-hidden className="mx-auto mt-2 h-1.5 w-9 rounded-full bg-[rgb(60_60_67/0.25)] sm:hidden" />
          <DialogHeader className="relative px-4 pt-3 pb-1 sm:pt-4">
            <TextButton onClick={() => setReviewOpen(false)} disabled={pending} className="absolute top-3 left-4 sm:top-4">Cancel</TextButton>
            <DialogTitle className="text-center text-[17px] font-semibold">{confirmed ? 'New time' : 'Confirm booking'}</DialogTitle>
            <DialogDescription className="text-center text-[12px] tabular-nums">{ticket.ticket_ref}</DialogDescription>
          </DialogHeader>

          {date && (
            <div className="space-y-5 px-4 pt-3 pb-4">
              {/* The event: what goes on the Bookings calendar, and when */}
              <div className="px-1">
                <p className="text-[22px] leading-tight font-bold tracking-[-0.02em]">{ticket.service_type}</p>
                <p className="mt-0.5 text-[15px] text-muted-foreground">{ticket.contact_name}</p>
                <p className="mt-3 text-[15px] font-medium">{dayLabel(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-[15px] text-muted-foreground tabular-nums">
                  {formatTime(time)} to {pastMidnight ? 'past midnight' : formatTime(fromMin(end))} · {durationLabel(hours)}
                </p>
                {ticket.preferred_date && (
                  <p className={cn('mt-1.5 flex items-center gap-1 text-[13px]', ticket.preferred_date === date ? 'text-[#248a3d]' : 'text-[#c93400]')}>
                    {ticket.preferred_date === date
                      ? <><RiCheckLine className="size-4" aria-hidden /> Their preferred date</>
                      : <><RiAlertLine className="size-4" aria-hidden /> They preferred {shortDay(ticket.preferred_date)}</>}
                  </p>
                )}
              </div>

              {/* That day, as one strip */}
              <DayStrip bookings={dayList} start={start} end={end} clashIds={new Set(clashes.map(c => c.id))} />

              {/* Customer: icon rows, no labels */}
              <Group footer="Added to the Bookings calendar with the address and these details.">
                <Row icon={RiUser3Line} trailing={
                  <a href={`tel:${ticket.contact_number.replace(/[\s\-()]/g, '')}`} className="text-primary tabular-nums hover:opacity-70">{ticket.contact_number}</a>
                }>
                  {ticket.contact_name}
                </Row>
                <Row icon={RiMapPin2Line} trailing={
                  <a
                    href={ticket.map_url ?? `https://maps.google.com/?q=${encodeURIComponent(ticket.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:opacity-70"
                  >
                    Maps
                  </a>
                }>
                  {ticket.address}
                </Row>
                {ticket.unit_details && <Row icon={RiTempColdLine}>{ticket.unit_details}</Row>}
                {ticket.problem_description && <Row icon={RiChatQuoteLine}>{ticket.problem_description}</Row>}
              </Group>
            </div>
          )}

          <form id="confirm-booking" action={action}>
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="time" value={time} />
            <input type="hidden" name="hours" value={hours} />
          </form>

          <div className="space-y-2 px-4 pb-5">
            {state.error && <p role="alert" className="text-center text-[13px] text-destructive">{state.error}</p>}
            {pastMidnight && <p role="alert" className="text-center text-[13px] text-destructive">The job has to end by midnight.</p>}
            <Button type="submit" form="confirm-booking" className={cn(PILL, 'h-12 w-full text-[17px]')} disabled={pending || pastMidnight}>
              {pending && <RiLoader4Line className="animate-spin" aria-hidden />}
              {confirmed ? 'Save new time' : 'Confirm booking'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** iOS filled button: blue pill with a soft coloured glow */
const PILL = 'h-11 rounded-full px-5 text-[15px] font-semibold shadow-[0_4px_14px_-4px_rgb(31_111_209/0.55)]'
const NAV_BUTTON = 'grid size-(--cell-size) place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 aria-disabled:opacity-30 [&_svg]:size-5'

/** A labelled part of the scheduler */
function Section({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={className}>
      <GroupLabel className="mb-2 px-1">{title}</GroupLabel>
      {children}
    </section>
  )
}

/** Start-time chip: soft grey fill, solid blue when picked, struck through when taken */
function Choice({ pressed, onClick, disabled, title, children }: {
  pressed: boolean; onClick: () => void; disabled?: boolean; title?: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      title={title}
      onClick={onClick}
      className="h-8 rounded-[10px] bg-[rgb(118_118_128/0.08)] text-[13px] font-medium tabular-nums text-foreground transition-all duration-200 hover:bg-[rgb(118_118_128/0.16)] active:scale-[0.92] disabled:cursor-not-allowed disabled:bg-transparent disabled:text-muted-foreground/40 disabled:line-through aria-pressed:bg-primary aria-pressed:text-white aria-pressed:shadow-[0_2px_8px_rgb(31_111_209/0.35)]"
    >
      {children}
    </button>
  )
}

/** Grouped-list row: grey glyph, the value, and an optional blue action on the right */
function Row({ icon: Icon, trailing, children }: { icon: RemixiconComponentType; trailing?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 pl-4">
      <Icon className="mt-3 size-[18px] shrink-0 text-[rgb(60_60_67/0.45)]" aria-hidden />
      <div className={cn('flex min-w-0 flex-1 items-start gap-3 border-t py-2.5 pr-4 text-[15px] [div:first-child>&]:border-t-0', HAIRLINE)}>
        <p className="min-w-0 flex-1 whitespace-pre-wrap">{children}</p>
        {trailing && <span className="shrink-0 text-[15px]">{trailing}</span>}
      </div>
    </div>
  )
}

/**
 * The day as one strip, like a compressed iOS Calendar day: other jobs in grey, this booking
 * in blue, anything it overlaps in orange. Who else is booked is listed underneath.
 */
function DayStrip({ bookings, start, end, clashIds }: {
  bookings: DayBooking[]; start: number; end: number; clashIds: Set<string>
}) {
  const timed = bookings.filter(b => b.scheduled_start && b.scheduled_end)
  const times = timed.flatMap(b => [toMin(b.scheduled_start!), toMin(b.scheduled_end!)])
  const from = Math.floor(Math.min(7 * 60, start, ...times) / 60) * 60
  const to = Math.ceil(Math.min(24 * 60, Math.max(19 * 60, end, ...times)) / 60) * 60
  const pct = (m: number) => `${((Math.min(Math.max(m, from), to) - from) / (to - from)) * 100}%`
  const span = (a: number, b: number) => ({ left: pct(a), width: `calc(${pct(b)} - ${pct(a)})` })
  const ticks = [from, Math.round((from + to) / 2 / 60) * 60, to]

  return (
    <div className="px-1">
      <div className="relative h-7 overflow-hidden rounded-[8px] bg-[rgb(118_118_128/0.12)]">
        {timed.map(b => (
          <span
            key={b.id}
            title={`${b.contact_name}, ${formatTime(b.scheduled_start!)} – ${formatTime(b.scheduled_end!)}`}
            className={cn('absolute inset-y-0 border-x border-white', clashIds.has(b.id) ? 'bg-[#ff9500]' : 'bg-[rgb(60_60_67/0.28)]')}
            style={span(toMin(b.scheduled_start!), toMin(b.scheduled_end!))}
          />
        ))}
        <span
          className="absolute inset-y-1 rounded-[5px] bg-primary shadow-[0_2px_8px_rgb(31_111_209/0.45)] ring-2 ring-white"
          style={span(start, Math.min(end, to))}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground tabular-nums">
        {ticks.map(t => <span key={t}>{formatTime(fromMin(t)).replace(':00', '')}</span>)}
      </div>
      <p className={cn('mt-1.5 text-[13px]', clashIds.size ? 'text-[#c93400]' : 'text-muted-foreground')}>
        {timed.length === 0
          ? 'Nothing else booked that day.'
          : timed.map((b, i) => (
            <span key={b.id}>
              {i > 0 && ' · '}
              <span className={cn(clashIds.has(b.id) && 'font-medium')}>{b.contact_name}</span>{' '}
              <span className="tabular-nums">{formatTime(b.scheduled_start!).replace(':00', '')}–{formatTime(b.scheduled_end!).replace(':00', '')}</span>
            </span>
          ))}
        {clashIds.size > 0 && ' · overlaps'}
      </p>
    </div>
  )
}
