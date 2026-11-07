'use client'

import { useActionState, useState } from 'react'
import { RiLoader4Line, RiLoopLeftLine } from '@remixicon/react'
import {
  cancelTicket, createBackjob, setWarranty, saveNotes, type TicketActionState,
} from '@/app/actions/tickets'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { dayLabel, todayPH } from '@/lib/calendar'
import { CANCELLATION_REASONS, defaultWarranty, type WarrantyDays } from '@/lib/tickets'
import { cn } from '@/lib/utils'
import { IOS_TYPE, MENU, PILL, REVEAL, SHEET } from '../../ios'
import { useCompleteJob, type CompleteJob } from '../../CompleteFlow'
import { WarrantyChooser } from '../../WarrantyChooser'

function Feedback({ state }: { state: TicketActionState }) {
  if (state.error) return <p role="alert" className={cn('mt-2 text-sm text-destructive', REVEAL)}>{state.error}</p>
  if (state.ok) return <p role="status" className={cn('mt-2 text-sm text-emerald-700', REVEAL)}>{state.ok}</p>
  return null
}

const Spinner = ({ on }: { on: boolean }) => (on ? <RiLoader4Line className="animate-spin" aria-hidden /> : null)

export function NotesForm({ id, notes }: { id: string; notes: string }) {
  const [state, action, pending] = useActionState(saveNotes.bind(null, id), {})

  return (
    <form action={action}>
      <Label htmlFor="notes" className="sr-only">Staff notes</Label>
      <Textarea
        id="notes"
        className="rounded-xl"
        name="notes"
        rows={4}
        maxLength={4000}
        defaultValue={notes}
        placeholder="Assigned tech, parts needed, quote given…"
      />
      <div className="mt-2 flex items-center gap-3">
        <Button type="submit" variant="outline" size="sm" className="rounded-full" disabled={pending}>
          <Spinner on={pending} /> Save notes
        </Button>
        <Feedback state={state} />
      </div>
    </form>
  )
}

/** Mark a confirmed job completed: confirms, then offers a rebook reminder */
export function CompleteButton({ job, variant = 'default', className }: {
  job: CompleteJob; variant?: 'default' | 'outline'; className?: string
}) {
  const completeJob = useCompleteJob()
  return (
    <div className={className}>
      <Button type="button" variant={variant} onClick={() => completeJob(job)} className="h-11 w-full rounded-full text-[15px] font-semibold">
        Mark as completed
      </Button>
    </div>
  )
}

/**
 * Pick a reason, then confirm in a dialog. (A shadcn dialog rather than the browser's
 * confirm(), which some browsers block silently, making the button look dead.)
 */
export function CancelForm({ id }: { id: string }) {
  const [reason, setReason] = useState('')
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(async () => {
    const result = await cancelTicket(id, reason)
    if (result.ok) setOpen(false)
    return result
  }, {} as TicketActionState)
  const reasonLabel = CANCELLATION_REASONS.find(r => r.value === reason)?.label

  return (
    <div>
      <div className="flex gap-2">
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger aria-label="Cancellation reason" className="min-w-0 flex-1">
            <SelectValue placeholder="Choose a reason…" />
          </SelectTrigger>
          <SelectContent className={MENU}>
            {CANCELLATION_REASONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" disabled={!reason} onClick={() => setOpen(true)} className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
          Cancel booking
        </Button>
      </div>
      {!reason && <p className="mt-2 text-xs text-muted-foreground">Choose a reason first.</p>}
      <Feedback state={state} />

      <Dialog open={open} onOpenChange={o => !pending && setOpen(o)}>
        <DialogContent className={cn(IOS_TYPE, SHEET, 'gap-4 bg-white p-6 sm:max-w-md')}>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              Reason: <span className="font-medium text-foreground">{reasonLabel}</span>. If it&apos;s on the Bookings calendar, the event will be deleted too.
            </DialogDescription>
          </DialogHeader>
          {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)} className={cn(PILL, 'shadow-none')}>Keep booking</Button>
            <form action={action}>
              <Button type="submit" variant="destructive" disabled={pending} className={cn(PILL, 'w-full bg-destructive text-white shadow-[0_4px_14px_-4px_rgb(220_38_38/0.55)] hover:bg-destructive/90')}>
                <Spinner on={pending} /> Yes, cancel it
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** A finished job needs a return visit: opens a linked ticket to schedule */
export function BackjobForm({ id, underWarranty = false }: { id: string; underWarranty?: boolean }) {
  const [state, action, pending] = useActionState(createBackjob.bind(null, id), {})

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="concern">What needs fixing? <span className="font-normal text-muted-foreground">· Optional</span></Label>
        <Textarea id="concern" name="concern" rows={2} placeholder="e.g. Still not cooling after cleaning, leaking again" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="warranty" defaultChecked={underWarranty} className="size-4 accent-rose-600" /> Under warranty (no charge)
      </label>
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-full bg-rose-600 text-[15px] font-semibold text-white hover:bg-rose-700">
        <Spinner on={pending} /> <RiLoopLeftLine /> Create back job
      </Button>
      <Feedback state={state} />
    </form>
  )
}

/** A finished job's warranty: whether it's still covered, and a way to change it */
export function WarrantyCard({ id, service, jobDate, days, until }: {
  id: string
  service: string
  jobDate: string
  days: WarrantyDays | null
  until: string | null
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState<WarrantyDays | 0>(days ?? defaultWarranty(service))
  const [state, action, pending] = useActionState(async () => {
    const r = await setWarranty(id, value)
    if (r.ok) setEditing(false)
    return r
  }, {} as TicketActionState)
  const today = todayPH()
  const active = !!until && until >= today

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          {days && until ? (
            <>
              <p className="flex items-center gap-2 text-[17px] font-semibold">
                {days}-day warranty
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600')}>
                  {active ? 'Active' : 'Expired'}
                </span>
              </p>
              <p className="text-[13px] text-muted-foreground">
                {active ? 'Covered until' : 'Ended'} {dayLabel(until, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </>
          ) : (
            <p className="text-[15px] text-muted-foreground">No warranty on this job.</p>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)} className="rounded-full">
          {days ? 'Change' : 'Add warranty'}
        </Button>
        <Feedback state={state} />
      </div>
    )
  }

  return (
    <form action={action} className={REVEAL}>
      <WarrantyChooser value={value} onChange={setValue} jobDate={jobDate} disabled={pending} />
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)} disabled={pending} className="rounded-full">Cancel</Button>
        <Button type="submit" size="sm" disabled={pending} className="rounded-full px-4">
          <Spinner on={pending} /> Save warranty
        </Button>
      </div>
      <Feedback state={state} />
    </form>
  )
}
