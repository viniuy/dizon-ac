import Link from 'next/link'
import { RiArrowRightSLine, RiUserSearchLine } from '@remixicon/react'
import { dayLabel } from '@/lib/calendar'
import type { PastTicket } from '@/lib/customers'
import { getStage } from '@/lib/stage'
import { formatDateTime, SOURCE_LABEL } from '@/lib/tickets'
import { cn } from '@/lib/utils'
import { StageBadge } from '../../ui'
import { Group, HAIRLINE, ROW_PRESS } from '../../ios'

/** Earlier bookings from this customer (same number), plus same-name hints */
export function HistoryCard({ samePhone, sameName }: { samePhone: PastTicket[]; sameName: PastTicket[] }) {
  return (
    <div className="space-y-6">
      <Group
        title="History"
        action={samePhone.length > 0 && <span className="text-xs text-muted-foreground tabular-nums">{samePhone.length} before</span>}
      >
        {samePhone.length === 0 ? (
          <p className="px-4 py-3 text-[15px] text-muted-foreground">First booking from this number</p>
        ) : (
          <ul>{samePhone.map(p => <PastRow key={p.id} p={p} />)}</ul>
        )}
      </Group>

      {sameName.length > 0 && (
        <Group
          title={<span className="inline-flex items-center gap-1"><RiUserSearchLine className="size-3.5" aria-hidden /> Same name</span>}
          footer="Different number, but could be the same person."
        >
          <ul>{sameName.map(p => <PastRow key={p.id} p={p} showPhone />)}</ul>
        </Group>
      )}
    </div>
  )
}

/** A tappable list row with a chevron, like iOS Settings */
function PastRow({ p, showPhone }: { p: PastTicket; showPhone?: boolean }) {
  return (
    <li className={cn('ml-4 border-t first:border-t-0', HAIRLINE)}>
      <Link href={`/staff/tickets/${p.id}`} className={cn('-ml-4 flex items-center gap-3 py-2.5 pr-3 pl-4', ROW_PRESS)}>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px]">{p.service_type}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {p.scheduled_date ? dayLabel(p.scheduled_date, { month: 'short', day: 'numeric', year: 'numeric' }) : `Requested ${formatDateTime(p.created_at)}`}
            {' · '}{SOURCE_LABEL[p.source]}
            {showPhone ? ` · ${p.contact_number}` : ` · ${p.ticket_ref}`}
          </span>
        </span>
        <StageBadge stage={getStage({ ...p, scheduled_start: null, scheduled_end: null })} className="shrink-0" />
        <RiArrowRightSLine className="size-5 shrink-0 text-muted-foreground/50" aria-hidden />
      </Link>
    </li>
  )
}
