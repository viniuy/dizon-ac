'use client'

import { useState, useTransition } from 'react'
import { RiLoader4Line, RiPhoneLine } from '@remixicon/react'
import { setFollowUp, type TicketActionState } from '@/app/actions/tickets'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { addDays, addMonths, dayLabel, todayPH } from '@/lib/calendar'
import { cn } from '@/lib/utils'
import { FIELD, MENU, PILL, REVEAL } from './ios'

const MONTHS = [4, 5, 6]

/**
 * "Remind me to call this customer in 4, 5 or 6 months". Tapping a choice (or picking a
 * date) only selects it; nothing is saved until "Set reminder".
 */
export function ReminderChooser({ id, jobDate, phone, initial = '', onSaved, secondary }: {
  id: string
  /** The customer's number staff will call */
  phone: string
  /** The job's date ("YYYY-MM-DD"); the months count from here */
  jobDate: string
  /** A reminder that's already set, to start from */
  initial?: string
  onSaved?: (result: TicketActionState) => void
  /** e.g. a "Not now" button beside "Set reminder" */
  secondary?: React.ReactNode
}) {
  const today = todayPH()
  const [date, setDate] = useState(initial)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const options = MONTHS.map(m => ({ m, date: addMonths(jobDate, m) }))
  const chosenMonths = options.find(o => o.date === date)?.m

  const save = () => start(async () => {
    setError('')
    const r = await setFollowUp(id, { date })
    if (r.error) setError(r.error)
    else onSaved?.(r)
  })

  return (
    <div>
      <p className="mb-2 text-[13px] text-muted-foreground">Remind staff to call in</p>
      <div role="radiogroup" aria-label="Remind me in" className="grid grid-cols-3 gap-2">
        {options.map(o => {
          const on = chosenMonths === o.m
          return (
            <button
              key={o.m}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={pending || o.date <= today}
              onClick={() => setDate(o.date)}
              className={cn(
                'flex flex-col items-center rounded-xl px-2 py-2.5 transition-[background-color,color,box-shadow,transform] duration-200 active:scale-[0.97] disabled:opacity-40',
                on
                  ? 'bg-primary text-white shadow-[0_4px_14px_-4px_rgb(31_111_209/0.55)]'
                  : 'bg-[rgb(118_118_128/0.08)] text-primary hover:bg-[rgb(0_122_255/0.1)]',
              )}
            >
              <span className="text-[15px] font-semibold">{o.m} months</span>
              <span className={cn('text-[12px] tabular-nums', on ? 'text-white/80' : 'text-muted-foreground')}>
                {dayLabel(o.date, { month: 'short', day: 'numeric' })}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-3 mb-1.5 text-[13px] text-muted-foreground">Or pick a date</p>
      <DatePicker
        value={chosenMonths ? '' : date}
        onChange={setDate}
        min={addDays(today, 1)}
        placeholder="Choose a date"
        disabled={pending}
        className={cn(FIELD, 'flex items-center', date && !chosenMonths && 'bg-white ring-2 ring-primary/35')}
        contentClassName={MENU}
      />

      {date && (
        <p className={cn('mt-3 flex items-center gap-2 rounded-xl bg-[rgb(0_122_255/0.08)] px-3.5 py-2.5 text-[14px]', REVEAL)}>
          <RiPhoneLine className="size-4 shrink-0 text-primary" aria-hidden />
          <span>
            Call <span className="font-semibold tabular-nums">{phone}</span> on{' '}
            <span className="font-semibold">{dayLabel(date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </span>
        </p>
      )}
      {error && <p role="alert" className={cn('mt-2 text-sm text-destructive', REVEAL)}>{error}</p>}

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {secondary}
        <Button type="button" onClick={save} disabled={!date || pending || date === initial} className={cn(PILL, 'sm:min-w-40')}>
          {pending && <RiLoader4Line className="animate-spin" aria-hidden />} Set reminder
        </Button>
      </div>
    </div>
  )
}
