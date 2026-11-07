import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { SURFACE } from '../../ios'

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl" aria-busy aria-label="Loading form">
      <Skeleton className="h-4 w-16" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="mt-6 space-y-6">
        {[3, 3, 3].map((fields, g) => (
          <div key={g}>
            <Skeleton className="mb-2 ml-4 h-3 w-24" />
            <div className={cn(SURFACE, 'space-y-4 p-4')}>
              {g === 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(i => <Skeleton key={i} className="h-[68px] rounded-xl" />)}
                </div>
              ) : (
                Array.from({ length: fields - 1 }, (_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
