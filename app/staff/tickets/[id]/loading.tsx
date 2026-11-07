import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { SURFACE } from '../../ios'
import { CardSkeleton, PageHeaderSkeleton, ScheduleSkeleton } from '../../skeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl" aria-busy aria-label="Loading ticket">
      <PageHeaderSkeleton />
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <Skeleton className="mb-2 ml-4 h-3 w-20" />
          <div className={cn(SURFACE, 'p-5')}><ScheduleSkeleton /></div>
        </div>
        <div className="space-y-6 max-lg:order-first">
          <CardSkeleton lines={4} tall />
          <CardSkeleton lines={1} />
        </div>
      </div>
    </div>
  )
}
