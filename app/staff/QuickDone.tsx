'use client'

import { useEffect, useState, useTransition } from 'react'
import { RiCheckLine, RiLoader4Line } from '@remixicon/react'
import { completeFollowUp } from '@/app/actions/tickets'
import { cn } from '@/lib/utils'
import { useCompleteJob, type CompleteJob } from './CompleteFlow'

const BUTTON = 'flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-60'
const IDLE = 'bg-[rgb(52_199_89/0.12)] text-[#248a3d] hover:bg-[rgb(52_199_89/0.18)]'

/** Mark a job completed straight from the dashboard list: opens the confirm + reminder dialog */
export function QuickDone({ job }: { job: CompleteJob }) {
  const completeJob = useCompleteJob()
  return (
    <button type="button" onClick={() => completeJob(job)} aria-label={`Mark ${job.name} as done`} className={cn(BUTTON, IDLE, 'shrink-0')}>
      <RiCheckLine className="size-4" aria-hidden /> Done
    </button>
  )
}

/**
 * The rebooking call was made. The first tap arms it ("Confirm?"), the second does it,
 * so a stray tap on a phone can't clear a reminder. The row then drops off the list.
 */
export function QuickCalled({ id, name }: { id: string; name: string }) {
  const [armed, setArmed] = useState(false)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  // Disarm again if they don't follow through
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 3500)
    return () => clearTimeout(t)
  }, [armed])

  const onClick = () => {
    if (!armed) return setArmed(true)
    setArmed(false)
    setError('')
    start(async () => {
      const result = await completeFollowUp(id)
      if (result.error) setError(result.error)
    })
  }

  return (
    <span className="flex shrink-0 flex-col items-end">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-label={armed ? `Confirm you called ${name}` : `Mark ${name} as called`}
        className={cn(BUTTON, armed ? 'bg-[#34c759] text-white shadow-[0_4px_12px_-4px_rgb(52_199_89/0.7)]' : IDLE)}
      >
        {pending ? <RiLoader4Line className="size-4 animate-spin" aria-hidden /> : <RiCheckLine className="size-4" aria-hidden />}
        {pending ? 'Saving' : armed ? 'Confirm?' : 'Called'}
      </button>
      {error && <span role="alert" className="mt-1 max-w-40 text-right text-[11px] text-destructive">{error}</span>}
    </span>
  )
}
