// Parts of the ticket page that stream in after the ticket itself. Each takes a
// promise started by the page and is rendered inside its own <Suspense> skeleton.
import Link from 'next/link'
import { RiLoopLeftLine, RiUserHeartLine } from '@remixicon/react'
import { Badge } from '@/components/ui/badge'
import type { customerHistory } from '@/lib/customers'
import { STATUS_LABEL, type DayBooking, type TicketStatus } from '@/lib/tickets'
import { Button } from '@/components/ui/button'
import { HistoryCard } from './HistoryCard'
import { BackjobForm } from './TicketForms'
import { LazyConfirmBooking } from './LazyConfirmBooking'
import type { BookingSummary } from './ConfirmBooking'

type History = ReturnType<typeof customerHistory>
type Links = Promise<{ parent: { id: string; ticket_ref: string } | null; backjobs: { id: string; ticket_ref: string; status: TicketStatus }[] }>

const isOpen = (s: TicketStatus) => s === 'pending_confirmation' || s === 'confirmed'
type Availability = Promise<[Record<string, number>, DayBooking[]]>

export async function ReturningBadge({ history }: { history: History }) {
  const { samePhone } = await history
  if (!samePhone.length) return null
  return (
    <Badge variant="secondary" className="gap-1 text-sm">
      <RiUserHeartLine aria-hidden /> Returning customer · {samePhone.length + 1} bookings
    </Badge>
  )
}

export async function HistorySection({ history }: { history: History }) {
  const { samePhone, sameName } = await history
  return <HistoryCard samePhone={samePhone} sameName={sameName} />
}

/** "Back job for DAC-…" banner on a return visit, and the list of return visits on an original */
export async function BackjobLinks({ isBackjob, warranty, links }: { isBackjob: boolean; warranty: boolean; links: Links }) {
  const { parent, backjobs } = await links
  return (
    <>
      {isBackjob && (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <RiLoopLeftLine className="size-5 shrink-0" aria-hidden />
          <span className="font-semibold">Back job</span>
          <span>
            Return visit for{' '}
            {parent ? <Link href={`/staff/tickets/${parent.id}`} className="font-medium underline underline-offset-2">{parent.ticket_ref}</Link> : 'an earlier job'}
          </span>
          {warranty && <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">Under warranty</span>}
        </div>
      )}
      {backjobs.length > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-rose-900">
          <RiLoopLeftLine className="size-4" aria-hidden /> Back jobs:
          {backjobs.map(b => (
            <Link
              key={b.id}
              href={`/staff/tickets/${b.id}`}
              className={isOpen(b.status) ? 'rounded-full bg-rose-100 px-2 py-0.5 font-medium hover:bg-rose-200' : 'rounded-full bg-muted px-2 py-0.5 text-muted-foreground line-through decoration-1 hover:bg-muted/70'}
              title={STATUS_LABEL[b.status]}
            >
              {b.ticket_ref}
            </Link>
          ))}
        </p>
      )}
    </>
  )
}

/** The scheduling widget, once the month's availability has loaded */
export async function SchedulePanel({ availability, ...props }: {
  availability: Availability
  ticket: BookingSummary
  confirmed: boolean
  date: string
  time: string
  hours: number
}) {
  const [initialLoad, initialDayBookings] = await availability
  return <LazyConfirmBooking {...props} initialLoad={initialLoad} initialDayBookings={initialDayBookings} />
}

/** On a finished job: the back-job form, or the open back job if there already is one */
export async function BackjobPanel({ id, links }: { id: string; links: Links }) {
  const { backjobs } = await links
  const open = backjobs.find(b => isOpen(b.status))
  if (!open) return <BackjobForm id={id} />
  return (
    <div className="space-y-3">
      <p className="text-sm">
        Back job <span className="font-semibold">{open.ticket_ref}</span> is already open ({STATUS_LABEL[open.status].toLowerCase()}).
        Finish or cancel it before opening another.
      </p>
      <Button asChild className="h-10 w-full bg-rose-600 text-white hover:bg-rose-700">
        <Link href={`/staff/tickets/${open.id}`}><RiLoopLeftLine /> Open back job {open.ticket_ref}</Link>
      </Button>
    </div>
  )
}
