import { Skeleton } from '@/components/ui/skeleton'
import { CalendarSkeleton, ListCardSkeleton } from './skeletons'

// Shown instantly while the dashboard loads
export default function Loading() {
  return (
    <div className="space-y-4 xl:flex xl:h-[calc(100dvh-6.5rem)] xl:min-h-[34rem] xl:flex-col xl:gap-4 xl:space-y-0" aria-busy aria-label="Loading dashboard">
      <div className="flex items-baseline gap-3">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid items-start gap-6 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_360px] xl:overflow-hidden">
        <CalendarSkeleton />
        <div className="space-y-6">
          <ListCardSkeleton items={1} />
          <ListCardSkeleton />
        </div>
      </div>
    </div>
  )
}
