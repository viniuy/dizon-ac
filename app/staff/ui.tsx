import {
  RiCalendarCheckLine, RiCheckDoubleLine, RiCheckLine, RiCloseCircleLine, RiErrorWarningLine,
  RiHourglassLine, RiLoopLeftLine, RiMoneyDollarCircleLine, RiPlayCircleLine, RiTimeLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import { cn } from '@/lib/utils'
import { STATUS_DOT, type TicketStatus } from '@/lib/tickets'
import { STAGES, type Stage } from '@/lib/stage'

export const STAGE_ICON: Record<Stage, RemixiconComponentType> = {
  needs_approval: RiErrorWarningLine,
  upcoming: RiCalendarCheckLine,
  today: RiTimeLine,
  in_progress: RiPlayCircleLine,
  needs_closing: RiHourglassLine,
  completed: RiCheckLine,
  awaiting_payment: RiMoneyDollarCircleLine,
  paid: RiCheckDoubleLine,
  disputed: RiErrorWarningLine,
  cancelled: RiCloseCircleLine,
  backjob: RiLoopLeftLine,
}

export function StatusDot({ status, className }: { status: TicketStatus; className?: string }) {
  return <span aria-hidden className={cn('inline-block size-2 shrink-0 rounded-full', STATUS_DOT[status], className)} />
}

export function StageDot({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2 shrink-0 rounded-full', STAGES[stage].dot, stage === 'in_progress' && 'animate-pulse', className)}
    />
  )
}

/** Coloured pill with icon: the one place to read a ticket's state at a glance */
export function StageBadge({ stage, className, children }: { stage: Stage; className?: string; children?: React.ReactNode }) {
  const Icon = STAGE_ICON[stage]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap', STAGES[stage].badge, className)}>
      <Icon className="size-[1.1em]" aria-hidden />
      {children}
      {STAGES[stage].label}
    </span>
  )
}

export function BackjobTag() {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-rose-100 px-1.5 py-px text-[11px] font-medium text-rose-800">
      <RiLoopLeftLine className="size-3" aria-hidden /> Back job
    </span>
  )
}
