'use client'

import { createContext, useContext, useState, useTransition } from 'react'
import { RiCheckboxCircleFill, RiLoader4Line } from '@remixicon/react'
import { completeTicket } from '@/app/actions/tickets'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { addDays, dayLabel, todayPH } from '@/lib/calendar'
import { defaultWarranty, type WarrantyDays } from '@/lib/tickets'
import { cn } from '@/lib/utils'
import { IOS_TYPE, PILL, REVEAL, SHEET } from './ios'
import { ReminderChooser } from './ReminderChooser'
import { WarrantyChooser } from './WarrantyChooser'

export type CompleteJob = { id: string; name: string; service: string; jobDate: string | null; phone: string }

const Ctx = createContext<(job: CompleteJob) => void>(() => {})

/** Opens the "mark as completed" flow for a job: confirm with a warranty, then offer a rebook reminder */
export const useCompleteJob = () => useContext(Ctx)

/**
 * Lives in the staff layout, not in the row or card that opened it: completing a job
 * refreshes the pages and that row disappears, but this dialog stays up for step two.
 */
export function CompleteFlowProvider({ children }: { children: React.ReactNode }) {
  const [job, setJob] = useState<CompleteJob | null>(null)
  const [open, setOpen] = useState(false)

  const begin = (j: CompleteJob) => {
    setJob(j)
    setOpen(true)
  }

  return (
    <Ctx.Provider value={begin}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={cn(IOS_TYPE, SHEET, 'gap-0 bg-white p-6 sm:max-w-md')}>
          {/* Keyed so each job starts fresh at step one */}
          {job && <Flow key={job.id} job={job} close={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  )
}

function Flow({ job, close }: { job: CompleteJob; close: () => void }) {
  const [step, setStep] = useState<'confirm' | 'remind'>('confirm')
  const [warranty, setWarranty] = useState<WarrantyDays | 0>(() => defaultWarranty(job.service))
  const [error, setError] = useState('')
  const jobDate = job.jobDate ?? todayPH()
  const [pending, start] = useTransition()

  const complete = () => start(async () => {
    setError('')
    const r = await completeTicket(job.id, warranty)
    if (r.error) return setError(r.error)
    setStep('remind')
  })

  if (step === 'confirm') {
    return (
      <div className="space-y-5">
        <DialogHeader>
          <DialogTitle className="text-[20px]">Mark as completed?</DialogTitle>
          <DialogDescription>{job.name} · {job.service}</DialogDescription>
        </DialogHeader>
        <div>
          <p className="mb-2 text-[13px] text-muted-foreground">Warranty</p>
          <WarrantyChooser value={warranty} onChange={setWarranty} jobDate={jobDate} disabled={pending} />
        </div>
        {error && <p role="alert" className={cn('text-sm text-destructive', REVEAL)}>{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close} disabled={pending} className={cn(PILL, 'shadow-none')}>Cancel</Button>
          <Button type="button" onClick={complete} disabled={pending} autoFocus className={cn(PILL, 'sm:min-w-44')}>
            {pending && <RiLoader4Line className="animate-spin" aria-hidden />} Complete job
          </Button>
        </DialogFooter>
      </div>
    )
  }

  return (
    <div className={cn('space-y-5', REVEAL)}>
      <DialogHeader>
        <div className="flex items-center gap-2 text-emerald-700">
          <RiCheckboxCircleFill className="size-5" aria-hidden />
          <span className="text-[13px] font-semibold">
            Job completed
            {warranty > 0 && ` · ${warranty}-day warranty until ${dayLabel(addDays(jobDate, warranty), { month: 'short', day: 'numeric' })}`}
          </span>
        </div>
        <DialogTitle className="text-[20px]">Set a call reminder?</DialogTitle>
        <DialogDescription>
          Staff will be reminded to call {job.name} on{' '}
          <span className="font-semibold text-foreground tabular-nums">{job.phone}</span> about booking their next service.
          It shows on the Calendar page’s call list that week.
        </DialogDescription>
      </DialogHeader>
      <ReminderChooser
        id={job.id}
        jobDate={jobDate}
        phone={job.phone}
        onSaved={close}
        secondary={<Button type="button" variant="outline" onClick={close} className={cn(PILL, 'shadow-none')}>Not now</Button>}
      />
    </div>
  )
}
