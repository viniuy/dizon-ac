import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  RiArrowLeftSLine, RiArrowRightSLine, RiChat3Fill, RiMapPin2Fill, RiPhoneFill, type RemixiconComponentType,
} from '@remixicon/react'
import { Skeleton } from '@/components/ui/skeleton'
import { dayBookings, monthLoad } from '@/lib/availability'
import { dayLabel, todayPH } from '@/lib/calendar'
import { customerHistory } from '@/lib/customers'
import { getStage, STAGES } from '@/lib/stage'
import { requireStaff } from '@/lib/staff'
import { cn } from '@/lib/utils'
import { CANCELLATION_REASONS, formatTime, isClosedDay, SOURCE_LABEL, type Ticket, type TicketStatus } from '@/lib/tickets'
import { CardSkeleton, ScheduleSkeleton } from '../../skeletons'
import { StageBadge } from '../../ui'
import { DetailsCard } from './DetailsCard'
import { Group, HAIRLINE, REVEAL, ROW_PRESS, STAGGER } from '../../ios'
import { BackjobLinks, BackjobPanel, HistorySection, ReturningBadge, SchedulePanel } from './sections'
import { FollowUpPicker } from './FollowUpCard'
import { CancelForm, CompleteButton, NotesForm, WarrantyCard } from './TicketForms'

const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))

/** A grouped-list row that opens in place, for things that are rarely needed */
function More({ title, tone, children }: { title: string; tone?: 'destructive'; children: React.ReactNode }) {
  return (
    <details className={cn('group ml-4 border-t first:border-t-0', HAIRLINE)}>
      <summary
        className={cn(
          '-ml-4 flex cursor-pointer list-none items-center justify-between py-3 pr-4 pl-4 text-[15px]',
          ROW_PRESS,
          tone === 'destructive' ? 'text-red-600' : 'text-foreground',
        )}
      >
        {title}
        <RiArrowRightSLine className="size-5 text-muted-foreground/60 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-90" aria-hidden />
      </summary>
      <div className={cn('pr-4 pb-4', REVEAL)}>{children}</div>
    </details>
  )
}

export default async function TicketPage({ params }: PageProps<'/staff/tickets/[id]'>) {
  const { id } = await params
  const { supabase } = await requireStaff()
  const { data: t } = await supabase.from('tickets').select('*').eq('id', id).maybeSingle<Ticket>()
  if (!t) notFound()

  const stage = getStage(t)
  const finished = ['completed', 'awaiting_payment', 'paid'].includes(t.status)
  // Everything below the ticket itself streams in: these start now and are awaited
  // inside <Suspense> sections, so the page shows immediately with skeletons
  const history = customerHistory(supabase, t)
  const links = Promise.all([
    t.parent_ticket_id
      ? supabase.from('tickets').select('id,ticket_ref').eq('id', t.parent_ticket_id).maybeSingle<{ id: string; ticket_ref: string }>()
      : null,
    supabase.from('tickets').select('id,ticket_ref,status').eq('parent_ticket_id', t.id).order('created_at').returns<{ id: string; ticket_ref: string; status: TicketStatus }[]>(),
  ]).then(([p, c]) => ({ parent: p?.data ?? null, backjobs: c.data ?? [] }))
  // Availability for the date the scheduling picker opens on
  const pickDate = t.scheduled_date ?? (t.preferred_date && t.preferred_date >= todayPH() && !isClosedDay(t.preferred_date) ? t.preferred_date : '')
  const availability = t.status === 'pending_confirmation' || t.status === 'confirmed'
    ? Promise.all([
        monthLoad(supabase, (pickDate || todayPH()).slice(0, 7), t.id),
        pickDate ? dayBookings(supabase, pickDate, t.id) : Promise.resolve([]),
      ])
    : Promise.resolve([{}, []] as [Record<string, number>, []])
  const open = t.status === 'pending_confirmation' || t.status === 'confirmed'
  const hours = t.scheduled_start && t.scheduled_end
    ? Math.max(0.5, Math.round((minutes(t.scheduled_end) - minutes(t.scheduled_start)) / 30) / 2)
    : 2
  const slot = t.scheduled_date && t.scheduled_start && t.scheduled_end
    ? `${dayLabel(t.scheduled_date)}, ${formatTime(t.scheduled_start)} – ${formatTime(t.scheduled_end)}`
    : null
  const cancelReason = CANCELLATION_REASONS.find(r => r.value === t.cancelled_reason)?.label
  const tel = `tel:${t.contact_number.replace(/[\s\-()]/g, '')}`
  const directions = t.map_url ?? `https://maps.google.com/?q=${encodeURIComponent(t.address)}`
  const back = t.scheduled_date ? `/staff?month=${t.scheduled_date.slice(0, 7)}&day=${t.scheduled_date}` : '/staff'

  return (
    <div className={cn('mx-auto max-w-6xl', STAGGER)}>
      <Link href={back} prefetch className="inline-flex items-center gap-0.5 text-[15px] text-primary transition-opacity hover:opacity-70">
        <RiArrowLeftSLine className="-ml-1 size-5" aria-hidden /> Bookings
      </Link>

      {/* ── Header: large title, then Contacts-style action tiles ── */}
      <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1 basis-72">
          <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">{t.contact_name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
            <StageBadge stage={stage} />
            <Suspense fallback={null}><ReturningBadge history={history} /></Suspense>
            <span className="tabular-nums">{t.ticket_ref}</span>
            <span aria-hidden>·</span>
            <span>From {SOURCE_LABEL[t.source]}</span>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {stage === 'cancelled' && cancelReason ? `Cancelled: ${cancelReason}.` : STAGES[stage].hint}
          </p>
        </div>
        <nav aria-label="Contact" className="flex gap-2">
          <ActionTile href={tel} icon={RiPhoneFill} label="Call" />
          <ActionTile href={directions} icon={RiMapPin2Fill} label="Directions" external />
          {t.contact_link && <ActionTile href={t.contact_link} icon={RiChat3Fill} label="Chat" external />}
        </nav>
      </div>

      <Suspense fallback={null}>
        <BackjobLinks isBackjob={t.is_backjob} warranty={t.is_warranty_backjob} links={links} />
      </Suspense>

      {/* Wide main column for what to do now, a slim sidebar for reference */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ── Main: the action for this stage ──────────────── */}
        <div className="space-y-6">
          {stage === 'needs_approval' && (
            <Group title="Schedule" footer="Agree on a slot with the customer, then book it here." bodyClassName="p-5">
              <Suspense fallback={<ScheduleSkeleton />}>
                <SchedulePanel availability={availability} ticket={t} confirmed={false} date={pickDate} time="09:00" hours={2} />
              </Suspense>
            </Group>
          )}

          {t.status === 'confirmed' && (
            <Group title="Booked for">
              <div className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-semibold">{t.scheduled_date ? dayLabel(t.scheduled_date) : 'No date set'}</p>
                  {t.scheduled_start && t.scheduled_end && (
                    <p className="text-[15px] text-muted-foreground tabular-nums">
                      {formatTime(t.scheduled_start)} – {formatTime(t.scheduled_end)}
                    </p>
                  )}
                </div>
                <CompleteButton job={{ id: t.id, name: t.contact_name, service: t.service_type, jobDate: t.scheduled_date, phone: t.contact_number }} variant={stage === 'needs_closing' || stage === 'in_progress' ? 'default' : 'outline'} className="w-full sm:w-56" />
              </div>
              <details className={cn('group border-t', HAIRLINE)}>
                <summary className={cn('flex cursor-pointer list-none items-center justify-between px-5 py-3 text-[15px] text-primary', ROW_PRESS)}>
                  Change schedule
                  <RiArrowRightSLine className="size-5 text-muted-foreground/60 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-90" aria-hidden />
                </summary>
                <div className={cn('px-5 pb-5', REVEAL)}>
                  <Suspense fallback={<ScheduleSkeleton />}>
                    <SchedulePanel
                      availability={availability}
                      ticket={t}
                      confirmed
                      date={t.scheduled_date ?? ''}
                      time={t.scheduled_start?.slice(0, 5) ?? '09:00'}
                      hours={hours}
                    />
                  </Suspense>
                </div>
              </details>
            </Group>
          )}

          {finished && (
            <Group title="Warranty" bodyClassName="p-5">
              <WarrantyCard
                key={`${t.warranty_days}-${t.warranty_until}`}
                id={t.id}
                service={t.service_type}
                jobDate={t.scheduled_date ?? t.completed_at?.slice(0, 10) ?? todayPH()}
                days={t.warranty_days}
                until={t.warranty_until}
              />
            </Group>
          )}

          {finished && (
            <Group title="Rebook reminder" bodyClassName="p-5">
              <FollowUpPicker
                key={`${t.follow_up_date}-${t.follow_up_done_at}`}
                id={t.id}
                phone={t.contact_number}
                jobDate={t.scheduled_date ?? t.completed_at?.slice(0, 10) ?? todayPH()}
                date={t.follow_up_date}
                doneAt={t.follow_up_done_at}
              />
            </Group>
          )}

          {finished && (
            <Group
              title="Job done"
              footer="A back job opens a new linked ticket for the return visit, then you pick its schedule."
              bodyClassName="p-5"
            >
              {slot && <p className="mb-4 text-[15px] text-muted-foreground">{slot}</p>}
              <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <BackjobPanel id={t.id} links={links} underWarranty={!!t.warranty_until && t.warranty_until >= todayPH()} />
              </Suspense>
            </Group>
          )}

          {t.status === 'cancelled' && (
            <Group title="Cancelled" bodyClassName="p-5">
              <p className="text-[15px] text-muted-foreground">If the customer books again, add a new ticket.</p>
            </Group>
          )}
        </div>

        {/* ── Sidebar: the customer, their history, notes ─────── */}
        <aside className={cn('space-y-6 max-lg:order-first', STAGGER)}>
          <DetailsCard ticket={t} />
          <Suspense fallback={<CardSkeleton lines={2} />}><HistorySection history={history} /></Suspense>
          <Group>
            <More title={t.staff_notes ? 'Notes' : 'Add a note'}>
              <NotesForm id={t.id} notes={t.staff_notes ?? ''} />
            </More>
            {open && (
              <More title="Cancel booking" tone="destructive">
                <CancelForm id={t.id} />
              </More>
            )}
          </Group>
        </aside>
      </div>
    </div>
  )
}

/** Contacts-style tile: icon over a small label */
function ActionTile({ href, icon: Icon, label, external }: {
  href: string; icon: RemixiconComponentType; label: string; external?: boolean
}) {
  return (
    <a
      href={href}
      {...(external && { target: '_blank', rel: 'noreferrer' })}
      className="flex w-[76px] flex-col items-center gap-1 rounded-2xl bg-white py-2.5 text-primary shadow-[0_1px_2px_rgb(15_42_79/0.04),0_6px_16px_-8px_rgb(15_42_79/0.18)] ring-1 ring-black/[0.04] transition-transform active:scale-95"
    >
      <Icon className="size-5" aria-hidden />
      <span className="text-[11px] font-medium">{label}</span>
    </a>
  )
}
