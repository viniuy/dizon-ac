'use client'

import dynamic from 'next/dynamic'
import { ScheduleSkeleton } from '../../skeletons'

/**
 * The scheduling widget pulls in the date picker and review dialog, so its code
 * is only downloaded when a ticket actually needs scheduling. Skeleton meanwhile.
 * (Lazy loading has to be set up from a client component to split the bundle.)
 */
export const LazyConfirmBooking = dynamic(() => import('./ConfirmBooking').then(m => m.ConfirmBooking), {
  loading: () => <ScheduleSkeleton />,
})
