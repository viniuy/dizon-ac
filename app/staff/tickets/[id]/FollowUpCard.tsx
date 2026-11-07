'use client'

import { useState, useTransition } from 'react'
import { RiCheckLine, RiLoader4Line, RiPhoneLine } from '@remixicon/react'
import { clearFollowUp, completeFollowUp, type TicketActionState } from '@/app/actions/tickets'
import { Button } from '@/components/ui/button'
import { dayLabel, todayPH } from '@/lib/calendar'
import { cn } from '@/lib/utils'
import { REVEAL, TextButton } from '../../ios'
import { ReminderChooser } from '../../ReminderChooser'

function Feedback({ state }: { state: TicketActionState }) {
  if (state.error) return <p role="alert" className={cn('mt-2 text-sm text-destructive', REVEAL)}>{state.error}</p>
  if (state.ok) return <p role="status" className={cn('mt-2 text-sm text-emerald-700', REVEAL)}>{state.ok}</p>
  return null
}

const short = (d: string) => dayLabel(d, { month: 'short', day: 'numeric', year: 'numeric' })

/** The ticket page's rebook reminder: what's set, or the chooser to set one */
export function FollowUpPicker({ id, phone, jobDate, date, doneAt }: {
  id: string
  /** The customer's number staff will call */
  phone: string
  /** When the job was done ("YYYY-MM-DD"); the months count from here */
  jobDate: string
  date: string | null
  doneAt: string | null
}) {
  const [state, setState] = useState<TicketActionState>({})
  const [pending, start] = useTransition()
  const [busy, setBusy] = useState<string>('')
  const [editing, setEditing] = useState(false)
  const today = todayPH()

  const run = (key: string, fn: () => Promise<TicketActionState>) => {
    setBusy(key)
    start(async () => setState(await fn()))
  }
  const spin = (key: string) => (pending && busy === key ? <RiLoader4Line className="size-4 animate-spin" aria-hidden /> : null)

  // A reminder is waiting: show it, with what can be done about it
  if (date && !doneAt && !editing) {
    const due = date <= today
    return (
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', due ? 'bg-[#ff9500] text-white' : 'bg-[rgb(0_122_255/0.1)] text-primary')}>
            <RiPhoneLine className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-semibold">
              Call{' '}
              <a href={`tel:${phone.replace(/[\s\-()]/g, '')}`} className="text-primary tabular-nums hover:underline">{phone}</a>
              {due ? ' now' : ` on ${dayLabel(date, { weekday: 'short', month: 'short', day: 'numeric' })}`}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {due ? `To rebook. Was due ${short(date)}.` : 'To rebook. Staff see it on the Calendar page’s call list that week.'}
            </p>
          </div>
          <Button type="button" disabled={pending} onClick={() => run('done', () => completeFollowUp(id))} className="h-10 rounded-full px-4 text-[14px] font-semibold">
            {spin('done') ?? <RiCheckLine aria-hidden />} Called
          </Button>
        </div>
        <div className="mt-3 flex gap-5">
          <TextButton onClick={() => { setState({}); setEditing(true) }} disabled={pending}>Change</TextButton>
          <TextButton onClick={() => run('clear', () => clearFollowUp(id))} disabled={pending} className="inline-flex items-center gap-1 text-red-600">
            {spin('clear')} Remove
          </TextButton>
        </div>
        <Feedback state={state} />
      </div>
    )
  }

  return (
    <div>
      {doneAt && (
        <p className="mb-3 flex items-center gap-1.5 text-[13px] text-emerald-700">
          <RiCheckLine className="size-4" aria-hidden /> Called about rebooking on {short(doneAt.slice(0, 10))}.
        </p>
      )}
      <ReminderChooser
        id={id}
        phone={phone}
        jobDate={jobDate}
        initial={editing && date ? date : ''}
        secondary={editing && <Button type="button" variant="outline" onClick={() => setEditing(false)} className="h-11 rounded-full px-5">Cancel</Button>}
      />
      <Feedback state={state} />
    </div>
  )
}
