import { Skeleton } from '@/components/ui/skeleton'
import { TableSkeleton } from '../skeletons'

export default function Loading() {
  return (
    <div className="space-y-5" aria-busy aria-label="Loading tickets">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="flex-1 basis-64 space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl sm:w-80" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {['w-14', 'w-28', 'w-36', 'w-24', 'w-24', 'w-20'].map((w, i) => <Skeleton key={i} className={`h-8 shrink-0 rounded-full ${w}`} />)}
      </div>
      <TableSkeleton />
    </div>
  )
}
