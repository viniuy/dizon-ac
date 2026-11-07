import { Suspense } from 'react'
import Link from 'next/link'
import { RiPhoneFill } from '@remixicon/react'
import { dayLabel, isDate, monthGrid, monthOf, parseMonth, todayPH } from '@/lib/calendar'
import { returningKeys } from '@/lib/customers'
import { getStage, nowPH, type Stage } from '@/lib/stage'
import { requireStaff } from '@/lib/staff'
import { formatTime, type Ticket } from '@/lib/tickets'
import { CalendarBoard, type CalendarEntry, type CalendarItem } from './CalendarBoard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ListCardSkeleton } from './skeletons'
import { GlanceDock, type GlanceRequest } from './GlanceDock'
import { Group, HAIRLINE, PRESS, ROW_PRESS, STAGGER } from './ios'
import { QuickDone } from './QuickDone'
import { BackjobTag } from './ui'

const COLS = 'id,ticket_ref,status,contact_name,service_type,address,preferred_date,scheduled_date,scheduled_start,scheduled_end,created_at,is_backjob'
// New requests also carry what's needed to call and confirm
const REQUEST_COLS = `${COLS},contact_number,unit_details,problem_description,phone_key`
type Request = CalendarItem & Pick<Ticket, 'contact_number' | 'unit_details' | 'problem_description' | 'phone_key'>

export default async function CalendarPage({ searchParams }: PageProps<'/staff'>) {
  const params = await searchParams
  const today = todayPH()
  const now = nowPH()
  const month = parseMonth(params.month, isDate(params.day) ? params.day : today)
  const day = isDate(params.day) && monthOf(params.day) === month ? params.day : monthOf(today) === month ? today : `${month}-01`
  const grid = monthGrid(month)

  const { supabase } = await requireStaff()
  // To-do lists and counts stream in behind skeletons; only the calendar is awaited here
  const todo = loadTodo(supabase, today, now)
  const [scheduled, requested] = await Promise.all([
    supabase.from('tickets').select(COLS)
      .gte('scheduled_date', grid[0]).lte('scheduled_date', grid[41])
      .neq('status', 'cancelled')
      .order('scheduled_start')
      .returns<CalendarItem[]>(),
    supabase.from('tickets').select(COLS)
      .eq('status', 'pending_confirmation').is('scheduled_date', null)
      .gte('preferred_date', grid[0]).lte('preferred_date', grid[41])
      .returns<CalendarItem[]>(),
  ])

  const entries: Record<string, CalendarEntry[]> = {}
  const add = (d: string, e: CalendarEntry) => (entries[d] ??= []).push(e)
  scheduled.data?.forEach(t => add(t.scheduled_date!, { ...t, requested: false, stage: getStage(t, now) }))
  requested.data?.forEach(t => add(t.preferred_date!, { ...t, requested: true, stage: getStage(t, now) }))

  const error = scheduled.error ?? requested.error

  return (
    // xl+: header (3.5rem) + page padding (3rem) off the screen height, and nothing scrolls
    <div className={cn('space-y-4 xl:flex xl:h-[calc(100dvh-6.5rem)] xl:min-h-[34rem] xl:flex-col xl:space-y-0 xl:gap-4', STAGGER)}>
      {error && <p className="text-sm text-destructive">Couldn&apos;t load bookings: {error.message}</p>}
      <Suspense fallback={<AtAGlanceSkeleton />}>
        <AtAGlance todo={todo} today={today} />
      </Suspense>
      {/* Keyed by month so the selected day resets when the month changes */}
      <CalendarBoard key={month} month={month} initialDay={day} today={today} entries={entries}>
        <Suspense fallback={<><ListCardSkeleton items={1} /><ListCardSkeleton items={1} /></>}>
          <ActionLists todo={todo} />
        </Suspense>
      </CalendarBoard>
    </div>
  )
}

type Supabase = Awaited<ReturnType<typeof requireStaff>>['supabase']

/** New requests and confirmed jobs up to today, plus the headline counts */
async function loadTodo(supabase: Supabase, today: string, now: ReturnType<typeof nowPH>) {
  const [queue, active] = await Promise.all([
    supabase.from('tickets').select(REQUEST_COLS)
      .eq('status', 'pending_confirmation')
      .order('created_at')
      .limit(50)
      .returns<Request[]>(),
    // Confirmed jobs up to today: in progress, later today, or past and waiting to be closed
    supabase.from('tickets').select(COLS)
      .eq('status', 'confirmed')
      .lte('scheduled_date', today)
      .order('scheduled_date').order('scheduled_start')
      .limit(50)
      .returns<CalendarItem[]>(),
  ])
  const pending = queue.data ?? []
  const returning = await returningKeys(supabase, pending.map(t => t.phone_key))
  const activeStages = (active.data ?? []).map(t => ({ ...t, stage: getStage(t, now) }))
  const toClose = activeStages.filter(t => t.stage === 'needs_closing')
  const count = (s: Stage) => activeStages.filter(t => t.stage === s).length
  const summary = [
    { stage: 'needs_approval' as const, count: pending.length },
    { stage: 'needs_closing' as const, count: toClose.length },
    { stage: 'in_progress' as const, count: count('in_progress') },
    { stage: 'today' as const, count: count('today') },
  ]
  return { pending, returning, toClose, summary }
}
type Todo = ReturnType<typeof loadTodo>

/** Greeting, plus the at-a-glance counts in the floating panel on the left */
async function AtAGlance({ todo, today }: { todo: Todo; today: string }) {
  const { summary, pending, returning } = await todo
  const busy = summary.some(s => s.count > 0)
  const requests: GlanceRequest[] = pending.map(t => ({
    id: t.id,
    ref: t.ticket_ref,
    name: t.contact_name,
    service: t.service_type,
    when: t.preferred_date ? `Prefers ${dayLabel(t.preferred_date, { weekday: 'short', month: 'short', day: 'numeric' })}` : 'No preferred date',
    backjob: t.is_backjob,
    returning: returning.has(t.phone_key),
  }))
  return (
    <>
      {/* One line: greeting and today's date */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h1 className="text-[26px] leading-tight font-bold tracking-[-0.02em]">{busy ? 'Here’s what needs you today' : 'You’re all caught up'}</h1>
        <p className="text-[15px] font-semibold text-primary">{dayLabel(today)}</p>
      </div>
      <GlanceDock stats={summary} requests={requests} />
    </>
  )
}

function AtAGlanceSkeleton() {
  return (
    <div className="flex items-baseline gap-3">
      <Skeleton className="h-8 w-80" />
      <Skeleton className="h-4 w-40" />
    </div>
  )
}

/** Needs approval + Mark as done, in the side panel */
async function ActionLists({ todo }: { todo: Todo }) {
  const { pending, returning, toClose } = await todo
  return (
    <>
      <SideGroup title="Needs approval" count={pending.length} empty="No new requests.">
        {pending.map(t => <RequestRow key={t.id} t={t} returning={returning.has(t.phone_key)} />)}
      </SideGroup>
      <SideGroup title="Mark as done" count={toClose.length} empty="Nothing waiting to be closed.">
        {toClose.map(t => (
          <li key={t.id} className={cn('ml-4 flex items-center gap-2 border-t pr-3 first:border-t-0', HAIRLINE)}>
            <Link href={`/staff/tickets/${t.id}`} className={cn('-ml-4 min-w-0 flex-1 self-stretch py-2.5 pl-4', ROW_PRESS)}>
              <span className="block truncate text-[15px] font-medium">{t.contact_name}</span>
              <span className="block truncate text-[13px] text-muted-foreground">
                {t.ticket_ref} · {t.service_type} · was {dayLabel(t.scheduled_date!, { month: 'short', day: 'numeric' })}
                {t.scheduled_start && `, ${formatTime(t.scheduled_start)}`}
              </span>
            </Link>
            <QuickDone id={t.id} name={t.contact_name} />
          </li>
        ))}
      </SideGroup>
    </>
  )
}

/** A side-panel to-do list: tickets waiting on staff */
function SideGroup({ title, count, empty, children }: {
  title: string; count: number; empty: string; children: React.ReactNode
}) {
  return (
    <Group
      title={title}
      action={<span className="text-[13px] font-medium text-muted-foreground tabular-nums">{count}</span>}
    >
      {count === 0
        ? <p className="px-4 py-5 text-center text-[15px] text-muted-foreground">{empty}</p>
        : <ul aria-label={title} className={STAGGER}>{children}</ul>}
    </Group>
  )
}

/** A new request with just what's needed to call the customer and confirm */
function RequestRow({ t, returning }: { t: Request; returning: boolean }) {
  const concern = t.unit_details || t.problem_description
  return (
    <li className={cn('ml-4 flex items-center gap-3 border-t pr-3 first:border-t-0', HAIRLINE)}>
      <span aria-hidden className="mt-5 size-2 shrink-0 self-start rounded-full bg-[#ff9500]" />
      <Link href={`/staff/tickets/${t.id}`} className={cn('min-w-0 flex-1 self-stretch rounded-lg py-3', ROW_PRESS)}>
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-semibold">{t.contact_name}</span>
          {t.is_backjob && <BackjobTag />}
          {returning && <span className="shrink-0 rounded-full bg-violet-100 px-1.5 py-px text-[11px] font-medium text-violet-800">Returning</span>}
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{t.address}</span>
        <span className="mt-0.5 block truncate text-[13px]">
          {t.service_type}
          {concern && <span className="text-muted-foreground"> · {concern}</span>}
        </span>
        <span className="mt-0.5 block text-[12px] text-muted-foreground">
          {t.ticket_ref} · {t.preferred_date ? `Prefers ${dayLabel(t.preferred_date, { weekday: 'short', month: 'short', day: 'numeric' })}` : 'No preferred date'}
        </span>
      </Link>
      <a
        href={`tel:${t.contact_number.replace(/[\s\-()]/g, '')}`}
        aria-label={`Call ${t.contact_name} on ${t.contact_number}`}
        title={`Call ${t.contact_number}`}
        className={cn('grid size-9 shrink-0 place-items-center rounded-full bg-[#34c759] text-white shadow-[0_4px_12px_-4px_rgb(52_199_89/0.7)]', PRESS)}
      >
        <RiPhoneFill className="size-4" aria-hidden />
      </a>
    </li>
  )
}
