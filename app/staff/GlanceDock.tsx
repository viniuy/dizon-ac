'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RiArrowRightSLine } from '@remixicon/react'
import { STAGES, type Stage } from '@/lib/stage'
import { cn } from '@/lib/utils'
import { GLASS, HAIRLINE, ROW_PRESS, SPRING } from './ios'
import { BackjobTag, STAGE_ICON } from './ui'

export type GlanceStat = { stage: Stage; count: number }
export type GlanceRequest = {
  id: string; ref: string; name: string; service: string; when: string; backjob: boolean; returning: boolean
}

/** iOS system colours, one per stat, like the smart lists in Reminders */
const COLOR: Partial<Record<Stage, string>> = {
  needs_approval: 'bg-[#ff9500]',
  needs_closing: 'bg-[#ff3b30]',
  in_progress: 'bg-[#34c759]',
  today: 'bg-[#007aff]',
}

// How many new requests the popover lists before "See all"
const CARD_LIMIT = 6


/**
 * The at-a-glance counts in a Slide Over-style glass panel on the left. Very wide screens (1880px+)
 * have room for it in the margin, so it stays out. Otherwise it waits behind a small
 * grabber at the left edge: hover the edge and it glides in; tap the grabber on touch screens.
 */
export function GlanceDock({ stats, requests }: { stats: GlanceStat[]; requests: GlanceRequest[] }) {
  const [open, setOpen] = useState(false)
  const waiting = stats.find(s => s.stage === 'needs_approval')?.count ?? 0

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div
      data-open={open || undefined}
      onMouseLeave={() => setOpen(false)}
      // Only the edge strip, the grabber and the panel itself catch the pointer
      className="group/dock pointer-events-none fixed top-14 bottom-0 left-0 z-20 flex items-center"
    >
      {/* Edge strip: hovering anywhere along the left edge brings the panel in */}
      <div aria-hidden className="pointer-events-auto absolute inset-y-0 left-0 w-3 min-[1880px]:hidden" />

      {/* Grabber, like the Slide Over handle; the orange badge means requests are waiting */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Hide at a glance' : 'Show at a glance'}
        aria-expanded={open}
        className={cn(
          'pointer-events-auto absolute top-1/2 left-0 grid h-20 -translate-y-1/2 w-[18px] place-items-center rounded-r-[14px] transition-all duration-500',
          GLASS, SPRING,
          'hover:w-[22px] group-hover/dock:-translate-x-full group-hover/dock:opacity-0',
          'group-data-[open]/dock:-translate-x-full group-data-[open]/dock:opacity-0 min-[1880px]:hidden',
        )}
      >
        <span aria-hidden className="h-8 w-1 rounded-full bg-[rgb(60_60_67/0.3)]" />
        {waiting > 0 && (
          <span aria-hidden className="absolute -top-1.5 -right-1.5 grid size-[18px] place-items-center rounded-full bg-[#ff9500] text-[10px] font-bold text-white tabular-nums ring-2 ring-white">
            {waiting > 9 ? '9+' : waiting}
          </span>
        )}
      </button>

      <aside
        aria-label="At a glance"
        className={cn(
          'pointer-events-auto relative ml-3 w-56 rounded-[26px] p-2',
          GLASS,
          // Glides in from the edge; a short delay before hiding so a slipped pointer doesn't snap it shut
          'origin-left -translate-x-[calc(100%+1.5rem)] scale-[0.97] opacity-0 transition-[translate,scale,opacity] delay-150 duration-500',
          SPRING,
          'group-hover/dock:translate-x-0 group-hover/dock:scale-100 group-hover/dock:opacity-100 group-hover/dock:delay-0',
          'group-data-[open]/dock:translate-x-0 group-data-[open]/dock:scale-100 group-data-[open]/dock:opacity-100',
          'focus-within:translate-x-0 focus-within:scale-100 focus-within:opacity-100',
          'min-[1880px]:translate-x-0 min-[1880px]:scale-100 min-[1880px]:opacity-100',
        )}
      >
        <p className="px-2 pt-1 pb-2 text-[15px] font-semibold tracking-[-0.01em]">At a glance</p>

        {/* Reminders-style tiles, stacked */}
        <ul className="space-y-1.5">
          {stats.map(s => {
            const Icon = STAGE_ICON[s.stage]
            const tile = (
              <>
                <span className={cn('grid size-[30px] shrink-0 place-items-center rounded-full text-white shadow-[0_2px_6px_-1px_rgb(0_0_0/0.2)]', COLOR[s.stage] ?? 'bg-[#007aff]')}>
                  <Icon className="size-[17px]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[rgb(60_60_67/0.7)]">{STAGES[s.stage].label}</span>
                <span className={cn('text-[22px] leading-none font-bold tabular-nums', s.count === 0 && 'text-foreground/35')}>{s.count}</span>
              </>
            )
            const tileClass = 'flex items-center gap-2.5 rounded-[14px] bg-white py-2 pr-3 pl-2 shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-transform duration-200 active:scale-[0.97]'

            if (s.stage !== 'needs_approval') {
              return <li key={s.stage}><div className={tileClass}>{tile}</div></li>
            }
            return (
              // Not positioned, so the popover anchors to the panel and opens beside it, centred on it
              <li key={s.stage} className="group/approval">
                <Link
                  href="/staff/tickets?status=pending_confirmation"
                  aria-describedby="glance-requests"
                  className={cn(tileClass, 'ring-[#ff9500]/0 transition-[box-shadow,transform] group-hover/approval:ring-2 group-hover/approval:ring-[#ff9500]/45')}
                >
                  {tile}
                </Link>
                {/* Popover. The left padding bridges the gap, and hiding waits a beat so the pointer can cross over */}
                <div
                  id="glance-requests"
                  className={cn(
                    'invisible absolute top-1/2 left-full z-10 w-80 origin-left -translate-y-1/2 pl-3 max-sm:hidden',
                    'scale-[0.94] opacity-0 transition-[opacity,scale,visibility] delay-200 duration-300',
                    SPRING,
                    'group-hover/approval:visible group-hover/approval:scale-100 group-hover/approval:opacity-100 group-hover/approval:delay-0',
                    'group-focus-within/approval:visible group-focus-within/approval:scale-100 group-focus-within/approval:opacity-100',
                  )}
                >
                  <RequestsPopover requests={requests} total={s.count} />
                </div>
              </li>
            )
          })}
        </ul>
      </aside>
    </div>
  )
}

function RequestsPopover({ requests, total }: { requests: GlanceRequest[]; total: number }) {
  return (
    // Nearly opaque: a blur nested inside the panel's own blur can't see the page behind it
    <div className={cn('overflow-hidden rounded-[20px]', GLASS, 'bg-[rgb(246_247_250/0.96)]')}>
      <div className="flex items-baseline justify-between px-4 pt-3 pb-2">
        <p className="text-[17px] font-semibold tracking-[-0.02em]">Needs approval</p>
        <p className="text-[13px] text-[rgb(60_60_67/0.6)] tabular-nums">{total} waiting</p>
      </div>
      {requests.length === 0 ? (
        <p className="px-4 pt-2 pb-5 text-center text-[15px] text-[rgb(60_60_67/0.6)]">No new requests.</p>
      ) : (
        <ul className="mx-2 mb-2 max-h-[min(26rem,60vh)] overflow-y-auto rounded-[14px] bg-white/85">
          {requests.slice(0, CARD_LIMIT).map(r => (
            <li key={r.id} className={cn('ml-3.5 border-t first:border-t-0', HAIRLINE)}>
              <Link href={`/staff/tickets/${r.id}`} className={cn('-ml-3.5 flex items-center gap-2 py-2.5 pr-2.5 pl-3.5', ROW_PRESS)}>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-medium">{r.name}</span>
                    {r.backjob && <BackjobTag />}
                    {r.returning && <span className="shrink-0 rounded-full bg-violet-100 px-1.5 py-px text-[11px] font-medium text-violet-800">Returning</span>}
                  </span>
                  <span className="block truncate text-[13px] text-[rgb(60_60_67/0.6)]">{r.service} · {r.when}</span>
                </span>
                <RiArrowRightSLine className="size-5 shrink-0 text-[rgb(60_60_67/0.3)]" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {total > CARD_LIMIT && (
        <Link
          href="/staff/tickets?status=pending_confirmation"
          className="mx-2 mb-2 block rounded-[14px] bg-white/85 py-2.5 text-center text-[15px] font-medium text-[#007aff] transition-opacity hover:opacity-60"
        >
          See all {total}
        </Link>
      )}
    </div>
  )
}
