// Loading placeholders shaped like the real staff screens, so nothing jumps when data arrives
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { HAIRLINE, SURFACE } from './ios'

const rows = (n: number) => Array.from({ length: n }, (_, i) => i)

/** A grouped list's caps label, then its white body */
function GroupShell({ label = 'w-24', className, children }: { label?: string; className?: string; children: React.ReactNode }) {
  return (
    <div aria-busy aria-label="Loading">
      <Skeleton className={cn('mb-2 ml-4 h-3', label)} />
      <div className={cn(SURFACE, 'overflow-hidden', className)}>{children}</div>
    </div>
  )
}

/** Grouped list with a few rows */
export function CardSkeleton({ lines = 3, tall = false }: { lines?: number; tall?: boolean }) {
  return (
    <GroupShell>
      {rows(lines).map(i => (
        <div key={i} className={cn('ml-4 space-y-1.5 border-t py-3 pr-4 first:border-t-0', HAIRLINE)}>
          <Skeleton className="h-3 w-16" />
          <Skeleton className={tall && i === lines - 1 ? 'h-12 w-full' : 'h-4 w-full max-w-64'} />
        </div>
      ))}
    </GroupShell>
  )
}

export function CalendarSkeleton() {
  return (
    <div className={cn(SURFACE, 'p-3 sm:p-5')}>
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-7">
        {rows(7).map(i => <Skeleton key={`w${i}`} className="mb-2 ml-auto mr-2 h-3 w-6" />)}
        {rows(42).map(i => (
          <div key={i} className={cn('flex h-16 justify-end border-t p-1.5 sm:h-28', HAIRLINE)}>
            <Skeleton className="size-5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Side-panel list (Needs approval, Mark as done, Selected day) */
export function ListCardSkeleton({ items = 2 }: { items?: number }) {
  return (
    <GroupShell label="w-28">
      {rows(items).map(i => (
        <div key={i} className={cn('ml-4 space-y-2 border-t py-3 pr-4 first:border-t-0', HAIRLINE)}>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </GroupShell>
  )
}

export function TableSkeleton({ items = 8 }: { items?: number }) {
  return (
    <GroupShell label="hidden">
      {rows(items).map(i => (
        <div
          key={i}
          className={cn('ml-4 space-y-2 border-t py-3.5 pr-4 first:border-t-0 md:grid md:grid-cols-[6.5rem_1fr_11rem_9.5rem_9rem] md:items-center md:gap-4 md:space-y-0', HAIRLINE)}
        >
          <Skeleton className="h-3.5 w-20 max-md:hidden" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-4 w-24 max-md:hidden" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      ))}
    </GroupShell>
  )
}

/** The scheduler: calendar on the left, times on the right */
export function ScheduleSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-[16rem_1fr]" aria-busy aria-label="Loading schedule">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {rows(35).map(i => <Skeleton key={i} className="aspect-square rounded-full bg-muted/70" />)}
        </div>
      </div>
      <div className="space-y-4 max-sm:hidden">
        <Skeleton className="h-8 w-full rounded-[10px]" />
        <SlotsSkeleton />
      </div>
    </div>
  )
}

/** Start-time buttons while a day's bookings load */
export function SlotsSkeleton() {
  return (
    <div className="grid grid-cols-6 gap-1" aria-busy aria-label="Checking that day">
      {rows(24).map(i => <Skeleton key={i} className="h-8 rounded-[10px]" />)}
    </div>
  )
}

/** Back link, large title, then the status line */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-56" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}
