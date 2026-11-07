import { Suspense } from 'react'
import Link from 'next/link'
import { RiArrowRightSLine, RiSearchLine } from '@remixicon/react'
import { Input } from '@/components/ui/input'
import { dayLabel } from '@/lib/calendar'
import { returningKeys } from '@/lib/customers'
import { getStage, nowPH, STAGES, type Stage } from '@/lib/stage'
import { requireStaff } from '@/lib/staff'
import { formatTime, SOURCE_LABEL, STATUS_LABEL, TICKET_STATUSES, type Ticket, type TicketStatus } from '@/lib/tickets'
import { cn } from '@/lib/utils'
import { FIELD, Group, HAIRLINE, LargeTitle, ROW_PRESS, STAGGER } from '../ios'
import { TableSkeleton } from '../skeletons'
import { BackjobTag, StageBadge } from '../ui'

const TABS: { key: string; label: string; statuses: TicketStatus[]; only?: (s: Stage) => boolean }[] = [
  { key: 'open', label: 'Open', statuses: ['pending_confirmation', 'confirmed'] },
  { key: 'action', label: 'Needs action', statuses: ['pending_confirmation', 'confirmed', 'disputed'], only: s => STAGES[s].needsAction },
  ...TICKET_STATUSES.map(s => ({ key: s, label: STATUS_LABEL[s], statuses: [s] })),
  { key: 'all', label: 'All', statuses: TICKET_STATUSES },
]

const COLS = 'id,ticket_ref,status,source,phone_key,is_backjob,contact_name,contact_number,service_type,address,preferred_date,scheduled_date,scheduled_start,scheduled_end,created_at'
type Row = Pick<Ticket, 'id' | 'ticket_ref' | 'status' | 'source' | 'phone_key' | 'is_backjob' | 'contact_name' | 'contact_number' | 'service_type' | 'address' | 'preferred_date' | 'scheduled_date' | 'scheduled_start' | 'scheduled_end' | 'created_at'>

const short = (d: string) => dayLabel(d, { month: 'short', day: 'numeric' })

export default async function TicketsPage({ searchParams }: PageProps<'/staff/tickets'>) {
  const { status, q } = await searchParams
  const tab = TABS.find(t => t.key === status) ?? TABS[0]
  // Characters that would break PostgREST's or() filter syntax
  const search = typeof q === 'string' ? q.replace(/[,()*%\\]/g, ' ').trim().slice(0, 60) : ''

  const tabHref = (key: string) => {
    const p = new URLSearchParams()
    if (key !== 'open') p.set('status', key)
    if (search) p.set('q', search)
    const s = p.toString()
    return s ? `/staff/tickets?${s}` : '/staff/tickets'
  }

  return (
    <div className={cn('space-y-5', STAGGER)}>
      <LargeTitle title="Tickets" subtitle="Every booking request and job.">
        <form action="/staff/tickets" role="search" className="relative w-full sm:w-80">
          {tab.key !== 'open' && <input type="hidden" name="status" value={tab.key} />}
          <RiSearchLine aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Search name, phone, address, ref"
            aria-label="Search tickets"
            className={cn(FIELD, 'h-10 pl-9')}
          />
        </form>
      </LargeTitle>

      {/* Filter chips; each one is a link so filters are shareable */}
      <nav aria-label="Filter by status" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map(t => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            prefetch
            aria-current={t.key === tab.key ? 'page' : undefined}
            className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-[14px] font-medium text-foreground/75 shadow-[0_1px_2px_rgb(15_42_79/0.06)] ring-1 ring-black/[0.05] transition-[color,background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground active:scale-[0.95] aria-[current=page]:bg-primary aria-[current=page]:text-white aria-[current=page]:shadow-[0_4px_12px_-4px_rgb(31_111_209/0.55)] aria-[current=page]:ring-0"
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {/* Keyed by filter so switching tabs or searching shows the skeleton at once */}
      <Suspense key={`${tab.key}|${search}`} fallback={<TableSkeleton />}>
        <TicketRows tab={tab} search={search} />
      </Suspense>
    </div>
  )
}

// Desktop columns: ref, customer, service, when, status, chevron
const ROW_GRID = 'md:grid md:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,11rem)_9.5rem_9rem_1.25rem] md:items-center md:gap-4'

/** The list itself, loaded separately from the page chrome */
async function TicketRows({ tab, search }: { tab: (typeof TABS)[number]; search: string }) {
  const { supabase } = await requireStaff()
  let query = supabase.from('tickets').select(COLS).in('status', tab.statuses)
  if (search) {
    query = query.or(['ticket_ref', 'contact_name', 'contact_number', 'address'].map(c => `${c}.ilike.*${search}*`).join(','))
  }
  const { data, error } = await query
    .order('scheduled_date', { ascending: false, nullsFirst: true })
    .order('created_at', { ascending: false })
    .limit(200)
    .returns<Row[]>()

  const now = nowPH()
  const rows = data?.map(t => ({ ...t, stage: getStage(t, now) })).filter(t => !tab.only || tab.only(t.stage))
  const returning = await returningKeys(supabase, rows?.map(t => t.phone_key) ?? [])

  return (
    <Group footer={rows?.length ? `${rows.length} ticket${rows.length === 1 ? '' : 's'}${rows.length === 200 ? ', newest first. Search to narrow it down.' : ''}` : undefined}>
      {error ? (
        <p className="py-10 text-center text-[15px] text-destructive">Couldn&apos;t load tickets: {error.message}</p>
      ) : !rows?.length ? (
        <p className="py-14 text-center text-[15px] text-muted-foreground">
          {search ? <>No tickets match &ldquo;{search}&rdquo;.</> : <>No {tab.label.toLowerCase()} tickets.</>}
        </p>
      ) : (
        <>
          <div aria-hidden className={cn('hidden border-b py-2 pr-4 pl-4 text-[12px] font-medium tracking-[0.04em] text-muted-foreground uppercase', ROW_GRID, HAIRLINE)}>
            <span>Ref</span><span>Customer</span><span>Service</span><span>When</span><span>Status</span><span />
          </div>
          <ul className={STAGGER}>
            {rows.map(t => (
              <li key={t.id} className={cn('ml-4 border-t first:border-t-0', HAIRLINE)}>
                <Link
                  href={`/staff/tickets/${t.id}`}
                  className={cn('relative -ml-4 block py-3 pr-4 pl-4 max-md:pr-9', ROW_PRESS, ROW_GRID)}
                >
                  <span className="text-[13px] text-muted-foreground tabular-nums max-md:hidden">{t.ticket_ref}</span>
                  <span className="block min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[15px] font-medium">{t.contact_name}</span>
                      {t.is_backjob && <BackjobTag />}
                      {returning.has(t.phone_key) && <span className="shrink-0 rounded-full bg-violet-100 px-1.5 py-px text-[11px] font-medium text-violet-800">Returning</span>}
                      {t.source !== 'web' && (
                        <span className="shrink-0 rounded-full bg-[rgb(118_118_128/0.12)] px-1.5 py-px text-[11px] text-muted-foreground">{SOURCE_LABEL[t.source]}</span>
                      )}
                    </span>
                    <span className="block truncate text-[13px] text-muted-foreground">{t.address}</span>
                  </span>
                  <span className="block truncate text-[14px] max-md:hidden">{t.service_type}</span>
                  <span className={cn('block text-[14px] tabular-nums max-md:mt-1 max-md:text-[13px]', !t.scheduled_date && 'text-muted-foreground')}>
                    <span className="md:hidden">{t.service_type} · </span>
                    {t.scheduled_date
                      ? <>{short(t.scheduled_date)}{t.scheduled_start && `, ${formatTime(t.scheduled_start)}`}</>
                      : t.preferred_date ? `Prefers ${short(t.preferred_date)}` : 'No date yet'}
                  </span>
                  <span className="block max-md:mt-1.5"><StageBadge stage={t.stage} /></span>
                  <RiArrowRightSLine
                    aria-hidden
                    className="size-5 text-muted-foreground/50 max-md:absolute max-md:top-1/2 max-md:right-3 max-md:-translate-y-1/2"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Group>
  )
}
